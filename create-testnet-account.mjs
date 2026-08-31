import { ec, stark, hash, CallData, RpcProvider, Account, constants } from "starknet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenZeppelin Account class hash on Starknet Sepolia
const OZ_CLASS_HASH = "0x5b4b537eaa2399e3aa99c4e2e0208ebd6c71bc1467938cd52c798c601e43564";
const RPC_URL = process.env.STARKNET_RPC_URL || "https://api.cartridge.gg/x/starknet/sepolia";

async function main() {
  const accountFile = path.resolve(__dirname, ".starknet-account.json");

  let privateKey, publicKey, accountAddress;

  if (fs.existsSync(accountFile)) {
    const existing = JSON.parse(fs.readFileSync(accountFile, "utf-8"));
    privateKey = existing.privateKey;
    publicKey = existing.publicKey;
    accountAddress = existing.accountAddress;
    console.log(`Found existing testnet account credentials in .starknet-account.json`);
  } else {
    // Generate new keypair
    privateKey = stark.randomAddress();
    publicKey = ec.starkCurve.getStarkKey(privateKey);
    const constructorCalldata = CallData.compile({ publicKey });
    accountAddress = hash.calculateContractAddressFromHash(
      publicKey,
      OZ_CLASS_HASH,
      constructorCalldata,
      0
    );

    const accountData = {
      accountAddress,
      privateKey,
      publicKey,
      classHash: OZ_CLASS_HASH,
      network: "starknet-sepolia",
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(accountFile, JSON.stringify(accountData, null, 2));
    console.log(`✨ Generated new Starknet Sepolia account! Saved to .starknet-account.json`);
  }

  console.log(`\n======================================================`);
  console.log(`📍 Testnet Account Address: ${accountAddress}`);
  console.log(`🔑 Private Key:             ${privateKey}`);
  console.log(`🔓 Public Key:              ${publicKey}`);
  console.log(`======================================================\n`);

  const provider = new RpcProvider({ nodeUrl: RPC_URL });

  // Check if contract is already deployed
  try {
    const classHash = await provider.getClassHashAt(accountAddress);
    console.log(`✅ Account contract is already deployed on-chain (Class hash: ${classHash}).`);
    console.log(`You can now deploy your contracts directly with:`);
    console.log(`  npm run deploy:testnet\n`);
    return;
  } catch (e) {
    console.log(`ℹ️  Account is not yet deployed on Sepolia.`);
  }

  // Check balance on Sepolia
  // STRK token on Sepolia: 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
  // ETH token on Sepolia:  0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
  const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
  const ETH_ADDRESS = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";

  let strkBalance = 0n;
  let ethBalance = 0n;

  try {
    const strkRes = await provider.callContract({
      contractAddress: STRK_ADDRESS,
      entrypoint: "balanceOf",
      calldata: [accountAddress]
    });
    strkBalance = BigInt(strkRes[0]);
  } catch {}

  try {
    const ethRes = await provider.callContract({
      contractAddress: ETH_ADDRESS,
      entrypoint: "balanceOf",
      calldata: [accountAddress]
    });
    ethBalance = BigInt(ethRes[0]);
  } catch {}

  console.log(`💰 Current Balance:`);
  console.log(`   STRK: ${Number(strkBalance) / 1e18} STRK`);
  console.log(`   ETH:  ${Number(ethBalance) / 1e18} ETH\n`);

  if (strkBalance === 0n && ethBalance === 0n) {
    console.log(`👉 Step 1: Fund this address from the Starknet Sepolia Faucet:`);
    console.log(`   🔗 https://starknet-faucet.vercel.app/  (or https://faucet.quicknode.com/starknet/sepolia)`);
    console.log(`   Paste address: ${accountAddress}`);
    console.log(`\n👉 Step 2: Once funded, run:`);
    console.log(`   node create-testnet-account.mjs`);
    console.log(`   (This will automatically deploy the account on-chain)\n`);
    return;
  }

  // Account has funds, deploy it!
  console.log(`🚀 Funds detected! Deploying account contract to Starknet Sepolia...`);
  const account = new Account({ provider, address: accountAddress, signer: privateKey });
  const constructorCalldata = CallData.compile({ publicKey });

  const deployAccountPayload = {
    classHash: OZ_CLASS_HASH,
    constructorCalldata,
    addressSalt: publicKey,
    contractAddress: accountAddress,
  };

  const { transaction_hash, contract_address } = await account.deployAccount(deployAccountPayload);
  console.log(`Tx Hash: ${transaction_hash}`);
  console.log(`Waiting for account deployment confirmation...`);
  await provider.waitForTransaction(transaction_hash);

  console.log(`\n🎉 Account successfully deployed!`);
  console.log(`Address: ${contract_address}`);
  console.log(`Explorer: https://sepolia.starkscan.co/contract/${contract_address}\n`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
