import { ethers, JsonRpcProvider, formatEther } from 'ethers';

class WalletService {
    static async setupGanacheNetwork() {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Add Ganache network to MetaMask
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x539', // 1337 in hex
                    chainName: 'Ganache Local',
                    nativeCurrency: {
                        name: 'ETH',
                        symbol: 'ETH',
                        decimals: 18
                    },
                    rpcUrls: ['http://localhost:8545'],
                    blockExplorerUrls: null
                }]
            });

            // Switch to Ganache network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x539' }]
            });

            return true;
        } catch (error) {
            console.error('Error setting up Ganache network:', error);
            throw error;
        }
    }

    static async importWalletToMetaMask(privateKey) {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // First setup Ganache network
            await this.setupGanacheNetwork();

            // Import account to MetaMask
            await window.ethereum.request({
                method: 'wallet_importRawKey',
                params: [
                    privateKey.replace('0x', ''), // Remove 0x prefix if present
                    'votely123' // Optional password for the account
                ]
            });

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            return {
                success: true,
                address: accounts[0]
            };
        } catch (error) {
            console.error('Error importing wallet:', error);
            if (error.code === 4001) {
                throw new Error('User rejected the request');
            }
            throw new Error('Failed to import wallet to MetaMask. Make sure Ganache is running on localhost:8545');
        }
    }

    static async connectMetaMask() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // First setup Ganache network
            await this.setupGanacheNetwork();

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            return accounts[0];
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            throw error;
        }
    }

    static getStoredWalletAddress() {
        return localStorage.getItem('walletAddress');
    }

    static storeWalletAddress(address) {
        localStorage.setItem('walletAddress', address);
    }

    static clearWalletData() {
        localStorage.removeItem('walletAddress');
    }

    static async verifyWalletConnection(expectedAddress) {
        try {
            if (!window.ethereum) {
                return false;
            }

            // Make sure we're on Ganache network
            try {
                await this.setupGanacheNetwork();
            } catch (error) {
                console.error('Error switching to Ganache:', error);
                return false;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (!accounts || accounts.length === 0) {
                return false;
            }

            // Compare with case-insensitive check
            return accounts[0].toLowerCase() === expectedAddress.toLowerCase();
        } catch (error) {
            console.error('Error verifying wallet connection:', error);
            return false;
        }
    }

    static async getGanacheBalance(address) {
        try {
            const provider = new JsonRpcProvider('http://localhost:8545');
            const balance = await provider.getBalance(address);
            return formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }
}

export default WalletService; 