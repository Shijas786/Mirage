export function useEvmWallet() { return { address: null, isConnected: false, chainId: null }; }
export function useEvmSwitch() { return { switchChain: () => {} }; }
export function useEvmConnect() { return { connect: () => {} }; }
