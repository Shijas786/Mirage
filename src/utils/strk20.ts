import type { STRK20_ACTION } from '@starknet-io/types-js';

// Assume a swap helper is deployed at this address
export const SWAP_HELPER_ADDRESS = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

export async function submitIntent(
  account: any, // starknet.js WalletAccount / WalletAccountV6
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  swapHelperAddress: string = SWAP_HELPER_ADDRESS
): Promise<string> {
  console.log("Submitting STRK20 intent to Dark Pool", { tokenIn, tokenOut, amountIn, swapHelperAddress });

  if (!account?.strk20InvokeTransaction) {
    throw new Error("Connected wallet does not support STRK20 API");
  }

  const actions: STRK20_ACTION[] = [
    // 1. Open the note the swap output will be credited into.
    { type: "transfer", token: tokenOut, amount: "OPEN", recipient: account.address },

    // 2. Call the helper. ${openNoteIds[0]} is the note opened above.
    {
      type: "invoke",
      contract: swapHelperAddress,
      calldata: [tokenIn, tokenOut, amountIn, "${openNoteIds[0]}"],
    },
  ];

  try {
    const { transaction_hash } = await account.strk20InvokeTransaction(actions);
    return transaction_hash;
  } catch (error) {
    console.error("Failed to submit STRK20 intent", error);
    throw error;
  }
}
