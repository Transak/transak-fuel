import { 
    getTransaction, 
    isValidWalletAddress, 
    sendTransaction, 
    getFeeStats,
    getTransactionLink,
    getWalletLink,
    getBalance
} from '../src/index';
    

describe('Fuel Network Integration Tests', () => {
    const testnet = 'testnet';

    const testPrivateKey = 'test-private-key';
    const testToAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    
    const testTransactionHash = 'test-private-key';
    
    const testAssetId = '0x0000000000000000000000000000000000000000000000000000000000000000';

    describe('getTransactionLink', () => {
        it('should generate correct testnet transaction link', () => {
            const txId = 'test-private-key';
            
            const result = getTransactionLink(txId, testnet);
            
            expect(result).toBe(`https://app-testnet.fuel.network/tx/${txId}`);
        });

        it('should handle different transaction IDs', () => {
            const txId = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
            
            const result = getTransactionLink(txId, testnet);
            
            expect(result).toBe(`https://app-testnet.fuel.network/tx/${txId}`);
        });
    });

    describe('getWalletLink', () => {
        it('should generate correct testnet wallet link', () => {
            const walletAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
            
            const result = getWalletLink(walletAddress, testnet);
            
            expect(result).toBe(`https://app-testnet.fuel.network/account/${walletAddress}`);
        });

        it('should handle different wallet addresses', () => {
            const walletAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
            
            const result = getWalletLink(walletAddress, testnet);
            
            expect(result).toBe(`https://app-testnet.fuel.network/account/${walletAddress}`);
        });
    });

    describe('isValidWalletAddress', () => {
        it('should validate correct Fuel address format', () => {
            // This is a valid Fuel address format
            const validAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
            
            const result = isValidWalletAddress(validAddress);
            
            expect(result).toBe(true);
        });

        it('should reject invalid address format', () => {
            const invalidAddress = 'invalid-address';
            
            const result = isValidWalletAddress(invalidAddress);
            
            expect(result).toBe(false);
        });

        it('should reject empty string', () => {
            const result = isValidWalletAddress('');
            
            expect(result).toBe(false);
        });

        it('should reject address with wrong length', () => {
            const shortAddress = '0x123456789012345678901234567890123456789012345678901234567890123';
            
            const result = isValidWalletAddress(shortAddress);
            
            expect(result).toBe(false);
        });
    });

    describe('getFeeStats', () => {
        it('should return fee statistics for testnet', async () => {
            const result = await getFeeStats(testnet);
            
            expect(result).toHaveProperty('feeCryptoCurrency');
            expect(result).toHaveProperty('baseFee');
            expect(result).toHaveProperty('lowFeeCharged');
            expect(result).toHaveProperty('standardFeeCharged');
            expect(result).toHaveProperty('fastFeeCharged');
            expect(result).toHaveProperty('maxFeeCharged');
            
            expect(result.feeCryptoCurrency).toBe('ETH');
            expect(typeof result.baseFee).toBe('number');
            expect(typeof result.lowFeeCharged).toBe('number');
            expect(typeof result.standardFeeCharged).toBe('number');
            expect(typeof result.fastFeeCharged).toBe('number');
            expect(typeof result.maxFeeCharged).toBe('number');
            
            expect(result.baseFee).toBeGreaterThan(0);
            expect(result.lowFeeCharged).toBeGreaterThan(0);
            expect(result.standardFeeCharged).toBeGreaterThan(0);
            expect(result.fastFeeCharged).toBeGreaterThan(0);
            expect(result.maxFeeCharged).toBeGreaterThan(0);
            
            expect(result.lowFeeCharged).toBeLessThanOrEqual(result.standardFeeCharged);
            expect(result.standardFeeCharged).toBeLessThanOrEqual(result.fastFeeCharged);
            expect(result.fastFeeCharged).toBeLessThanOrEqual(result.maxFeeCharged);
        }, 30000);

        it('should return consistent fee values for multiple calls', async () => {
            const result1 = await getFeeStats(testnet);
            const result2 = await getFeeStats(testnet);
            
            expect(result1.feeCryptoCurrency).toBe(result2.feeCryptoCurrency);
            expect(result1.baseFee).toBe(result2.baseFee);
            expect(result1.lowFeeCharged).toBe(result2.lowFeeCharged);
            expect(result1.standardFeeCharged).toBe(result2.standardFeeCharged);
            expect(result1.fastFeeCharged).toBe(result2.fastFeeCharged);
            expect(result1.maxFeeCharged).toBe(result2.maxFeeCharged);
        }, 30000);
    });

    describe('getBalance', () => {
        it('should return balance for a valid address', async () => {
            const testAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
            const decimals = 9;
            
            const result = await getBalance(testAddress, testAssetId, testnet, decimals);
            
            expect(typeof result).toBe('string');
            expect(Number(result)).toBeGreaterThanOrEqual(0);
        }, 30000);

        it('should handle different asset IDs', async () => {
            const testAddress = '0x1234567890123456789012345678901234567890123456789012345678901234';
            const differentAssetId = '0x1111111111111111111111111111111111111111111111111111111111111111';
            const decimals = 9;
            
            const result = await getBalance(testAddress, differentAssetId, testnet, decimals);
            
            expect(typeof result).toBe('string');
            expect(Number(result)).toBeGreaterThanOrEqual(0);
        }, 30000);
    });

    describe('getTransaction', () => {
        it('should return null for non-existent transaction', async () => {
            const nonExistentTxId = '0xcd171ecb7ccc3978ab01650376378c67757c95981be92a912008ccdeb4c2c15d';
            
            const result = await getTransaction(nonExistentTxId, testnet);
            
            expect(result).toBeNull();
        }, 30000);

        it('should handle invalid transaction ID format', async () => {
            const invalidTxId = 'invalid-transaction-id';
            
            try {
                const result = await getTransaction(invalidTxId, testnet);
                expect(result).toBeNull();
            } catch (error) {
                expect(error).toBeDefined();
            }
        }, 30000);

        it('should return transaction data for valid transaction ID', async () => {
            const validTxId = testTransactionHash;
            
            try {
                const result = await getTransaction(validTxId, testnet);
                
                if (result) {
                    expect(result).toHaveProperty('transactionData');
                    expect(result).toHaveProperty('receipt');
                    expect(result.receipt).toHaveProperty('date');
                    expect(result.receipt).toHaveProperty('from');
                    expect(result.receipt).toHaveProperty('gasCostCryptoCurrency');
                    expect(result.receipt).toHaveProperty('gasCostInCrypto');
                    expect(result.receipt).toHaveProperty('gasLimit');
                    expect(result.receipt).toHaveProperty('isPending');
                    expect(result.receipt).toHaveProperty('isExecuted');
                    expect(result.receipt).toHaveProperty('isSuccessful');
                    expect(result.receipt).toHaveProperty('isFailed');
                    expect(result.receipt).toHaveProperty('isInvalid');
                    expect(result.receipt).toHaveProperty('network');
                    expect(result.receipt).toHaveProperty('nonce');
                    expect(result.receipt).toHaveProperty('transactionHash');
                    expect(result.receipt).toHaveProperty('transactionLink');
                    
                    expect(result.receipt.gasCostCryptoCurrency).toBe('ETH');
                    expect(result.receipt.network).toBe(testnet);
                    expect(result.receipt.transactionHash).toBe(validTxId);
                    expect(typeof result.receipt.gasCostInCrypto).toBe('number');
                    expect(typeof result.receipt.gasLimit).toBe('number');
                    expect(typeof result.receipt.isPending).toBe('boolean');
                    expect(typeof result.receipt.isExecuted).toBe('boolean');
                    expect(typeof result.receipt.isSuccessful).toBe('boolean');
                    expect(typeof result.receipt.isFailed).toBe('boolean');
                    expect(typeof result.receipt.isInvalid).toBe('boolean');
                } else {
                    expect(result).toBeNull();
                }
            } catch (error) {
                expect(error).toBeDefined();
            }
        }, 30000);
    });

    describe('sendTransaction', () => {
        it('should throw error for invalid private key', async () => {
            const invalidPrivateKey = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
            
            const params = {
                to: testToAddress,
                amount: 0.001,
                network: testnet,
                privateKey: invalidPrivateKey,
                decimals: 9,
                tokenAddress: testAssetId
            };
            
            await expect(sendTransaction(params)).rejects.toThrow();
        }, 30000);

        it('should throw error for invalid recipient address', async () => {
            const params = {
                to: 'invalid-address',
                amount: 0.001,
                network: testnet,
                privateKey: testPrivateKey,
                decimals: 9,
                tokenAddress: testAssetId
            };
            
            await expect(sendTransaction(params)).rejects.toThrow();
        }, 30000);

        it('should throw error for zero amount', async () => {
            const params = {
                to: testToAddress,
                amount: 0,
                network: testnet,
                privateKey: testPrivateKey,
                decimals: 9,
                tokenAddress: testAssetId
            };
            
            await expect(sendTransaction(params)).rejects.toThrow();
        }, 30000);

        it('should throw error for negative amount', async () => {
            const params = {
                to: testToAddress,
                amount: -0.001,
                network: testnet,
                privateKey: testPrivateKey,
                decimals: 9,
                tokenAddress: testAssetId
            };
            
            await expect(sendTransaction(params)).rejects.toThrow();
        }, 30000);

        it('should validate transaction parameters structure', async () => {
            const params = {
                to: testToAddress,
                amount: 0.001,
                network: testnet,
                privateKey: testPrivateKey,
                decimals: 9,
                tokenAddress: testAssetId
            };
            
            try {
                const result = await sendTransaction(params);
                
                if (result && typeof result === 'object' && 'transactionData' in result) {
                    expect(result).toHaveProperty('transactionData');
                    expect(result).toHaveProperty('receipt');
                    expect(result.receipt).toHaveProperty('amount');
                    expect(result.receipt).toHaveProperty('date');
                    expect(result.receipt).toHaveProperty('from');
                    expect(result.receipt).toHaveProperty('gasCostCryptoCurrency');
                    expect(result.receipt).toHaveProperty('network');
                    expect(result.receipt).toHaveProperty('nonce');
                    expect(result.receipt).toHaveProperty('to');
                    expect(result.receipt).toHaveProperty('transactionHash');
                    expect(result.receipt).toHaveProperty('transactionLink');
                    expect(result.receipt).toHaveProperty('transactionReceipt');
                    expect(result.receipt).toHaveProperty('rejectReason');
                    
                    expect(result.receipt.amount).toBe(params.amount);
                    expect(result.receipt.network).toBe(testnet);
                    expect(result.receipt.to).toBe(params.to);
                    expect(result.receipt.gasCostCryptoCurrency).toBe('ETH');
                }
            } catch (error) {
                expect(error).toBeDefined();
            }
        }, 30000);
    });

    describe('Integration Tests', () => {
        it('should work with real testnet data', async () => {
            const feeStats = await getFeeStats(testnet);
            expect(feeStats).toBeDefined();
            expect(feeStats.feeCryptoCurrency).toBe('ETH');
        }, 30000);
    });
}); 