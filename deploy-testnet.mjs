import { Account, RpcProvider, json, Contract, CallData } from "starknet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default public Sepolia RPC endpoint
const DEFAULT_RPC = process.env.STARKNET_RPC_URL || "https://api.cartridge.gg/x/starknet/sepolia";

async function main() {
  let accountAddress = process.env.STARKNET_ACCOUNT_ADDRESS || process.env.ACCOUNT_ADDRESS;
  let privateKey = process.env.STARKNET_PRIVATE_KEY || process.env.PRIVATE_KEY;

  const accountFile = path.resolve(__dirname, ".starknet-account.json");
  if ((!accountAddress || !privateKey) && fs.existsSync(accountFile)) {
    try {
      const saved = JSON.parse(fs.readFileSync(accountFile, "utf-8"));
      accountAddress = accountAddress || saved.accountAddress;
      privateKey = privateKey || saved.privateKey;
      console.log(`Using credentials from .starknet-account.json`);
    } catch {}
  }

  if (!accountAddress || !privateKey) {
    console.error(`\n❌ Error: Missing STARKNET_ACCOUNT_ADDRESS or STARKNET_PRIVATE_KEY environment variables (and no .starknet-account.json found).\n`);
    console.log(`Usage:`);
    console.log(`  node create-testnet-account.mjs    # To generate and deploy an account`);
    console.log(`  npm run deploy:testnet             # Once account is set up`);
    process.exit(1);
  }

  const rpcUrl = process.env.STARKNET_RPC_URL || DEFAULT_RPC;
  console.log(`Connecting to Sepolia RPC: ${rpcUrl}`);
  const provider = new RpcProvider({ nodeUrl: rpcUrl });
  const account = new Account({ provider, address: accountAddress, signer: privateKey });

  const sierraPath = path.resolve(__dirname, "cairo/target/dev/strk20_invoke_helper_MirageDarkPool.contract_class.json");
  const casmPath = path.resolve(__dirname, "cairo/target/dev/strk20_invoke_helper_MirageDarkPool.compiled_contract_class.json");

  if (!fs.existsSync(sierraPath) || !fs.existsSync(casmPath)) {
    console.error(`Compiled artifacts not found. Please run 'scarb build' inside cairo directory first.`);
    process.exit(1);
  }

  console.log("Reading contract artifacts...");
  const sierra = json.parse(fs.readFileSync(sierraPath, "utf-8"));
  const casm = json.parse(fs.readFileSync(casmPath, "utf-8"));

  console.log(`Declaring contract class on Starknet Sepolia...`);
  const declarePayload = {
    contract: sierra,
    casm: casm,
  };

  try {
    const declareResponse = await account.declareIfNot(declarePayload);
    console.log(`Class Hash: ${declareResponse.class_hash}`);
    if (declareResponse.transaction_hash) {
      console.log(`Declaration Tx: ${declareResponse.transaction_hash}`);
      console.log(`Waiting for declaration transaction confirmation...`);
      await provider.waitForTransaction(declareResponse.transaction_hash);
    } else {
      console.log(`Class is already declared on-chain.`);
    }

    console.log(`Deploying contract instance...`);
    const deployResponse = await account.deployContract({
      classHash: declareResponse.class_hash,
      constructorCalldata: [],
    });

    console.log(`Deploy Tx: ${deployResponse.transaction_hash}`);
    console.log(`Waiting for deployment transaction confirmation...`);
    await provider.waitForTransaction(deployResponse.transaction_hash);

    const contractAddress = deployResponse.contract_address;
    console.log(`\n🎉 Contract successfully deployed to Sepolia Testnet!`);
    console.log(`   Contract Address: ${contractAddress}`);
    console.log(`   Class Hash:       ${declareResponse.class_hash}`);
    console.log(`   Explorer URL:     https://sepolia.starkscan.co/contract/${contractAddress}\n`);

    // Update address.md with sepolia address
    const addressMdPath = path.resolve(__dirname, "cairo/address.md");
    const addressContent = `contract class hash : ${declareResponse.class_hash}\n\ncontract address (sepolia) : ${contractAddress}\n`;
    fs.writeFileSync(addressMdPath, addressContent);
    console.log(`Updated cairo/address.md with testnet address.`);

  } catch (err) {
    console.error("Deployment failed with error:", err);
    process.exit(1);
  }
}

main();
