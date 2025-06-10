import { Network } from './types';

export const networks: Record<string, Network> = {
  main: {
    transactionLink: (transactionHash) => `https://app.fuel.network/tx/${transactionHash}`,
    walletLink: address => `https://app.fuel.network/account/${address}`,
    networkUrl: 'https://mainnet.fuel.network/v1/graphql',
    networkName: 'mainnet',
  },
  testnet: {
    transactionLink: (transactionHash) => `https://app-testnet.fuel.network/tx/${transactionHash}`,
    walletLink: address => `https://app-testnet.fuel.network/account/${address}`,
    networkName: 'testnet',
    networkUrl: "https://testnet.fuel.network/v1/graphql"
  },
};