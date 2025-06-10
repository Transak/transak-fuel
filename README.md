# @transak/transak-fuel

A TypeScript library for interacting with the Fuel blockchain, providing essential utilities for transaction management, wallet operations, and fee calculations.

## Installation

```bash
npm install @transak/transak-fuel
# or
yarn add @transak/transak-fuel
```

## Features

- Transaction management (send, get status)
- Wallet address validation
- Balance checking
- Fee estimation
- Network utilities

## API Reference

### Transaction Management

#### `getTransaction(txId: string, network: string): Promise<GetTransactionResult | null>`

Retrieves transaction details and status for a given transaction ID.

```typescript
const result = await getTransaction('0x123...', 'main');
```

Returns transaction data including:
- Transaction status (success/failure)
- Gas costs
- Transaction hash
- Network information
- Transaction link

#### `sendTransaction(params: SendTransactionParams): Promise<SendTransactionResult | {}>`

Sends a transaction on the Fuel network. The amount parameter accepts human-readable values (e.g., 0.001 for 0.001 ETH) and automatically converts them to base units based on the provided decimals.

```typescript
const result = await sendTransaction({
    to: '0x123...',
    amount: 0.001, // 0.001 ETH (will be converted to 1_000_000 base units for 9 decimals)
    network: 'main',
    privateKey: 'your-private-key',
    decimals: 9,
    tokenAddress: '0x...' // optional
});
```

**Note:** The amount is automatically converted from human-readable format to base units using the formula: `amount * 10^decimals`. For example, 0.001 ETH with 9 decimals becomes 1,000,000 base units.

### Wallet Operations

#### `isValidWalletAddress(walletAddress: string): Promise<boolean>`

Validates if a given string is a valid Fuel wallet address.

```typescript
const isValid = await isValidWalletAddress('0x123...');
```

#### `getBalance(walletAddress: string, assetId: string, network: string, decimals: number): Promise<string>`

Retrieves the balance of a specific asset for a wallet address.

```typescript
const balance = await getBalance('0x123...', '0x...', 'main', 9);
```

### Fee Management

#### `getFeeStats(network: string): Promise<getFeeStatsResult>`

Calculates estimated fees for different transaction speeds.

```typescript
const feeStats = await getFeeStats('main');
```

Returns:
- Base fee
- Low fee estimate
- Standard fee estimate
- Fast fee estimate
- Maximum fee estimate

### Network Utilities

#### `getTransactionLink(txId: string, network: string, blockchainRid: string): string`

Generates a blockchain explorer link for a transaction.

```typescript
const link = getTransactionLink('0x123...', 'main', 'blockchain-id');
```

#### `getWalletLink(walletAddress: string, network: string): string`

Generates a blockchain explorer link for a wallet address.

```typescript
const link = getWalletLink('0x123...', 'main');
```

## Types

### SendTransactionParams

```typescript
interface SendTransactionParams {
    to: string;
    amount: string;
    network: string;
    privateKey: string;
    decimals: number;
    tokenAddress?: string;
}
```

### GetTransactionResult

```typescript
interface GetTransactionResult {
    transactionData: any;
    receipt: {
        date: Date;
        from: string;
        gasCostCryptoCurrency: string;
        gasCostInCrypto: number;
        gasLimit: number;
        isPending: boolean;
        isExecuted: boolean;
        isSuccessful: boolean;
        isFailed: boolean;
        rejectReason: string;
        isInvalid: boolean;
        network: string;
        nonce: number;
        transactionHash: string;
        transactionLink: string;
    };
}
```

### getFeeStatsResult

```typescript
interface getFeeStatsResult {
    feeCryptoCurrency: string;
    baseFee: number;
    lowFeeCharged: number;
    standardFeeCharged: number;
    fastFeeCharged: number;
    maxFeeCharged: number;
}
```

## Error Handling

The library includes comprehensive error handling for all operations. Failed operations will throw errors with descriptive messages to help with debugging.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
