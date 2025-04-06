import { ethers } from 'ethers';

class WalletService {
    static async importWalletToMetaMask(privateKey) {
        try {
            // Check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Import account to MetaMask
            const importedAccount = await window.ethereum.request({
                method: 'wallet_importRawKey',
                params: [
                    privateKey.replace('0x', ''), // Remove 0x prefix if present
                    'votely123' // Optional password for the account
                ]
            });

            return {
                success: true,
                address: importedAccount
            };
        } catch (error) {
            console.error('Error importing wallet:', error);
            throw new Error('Failed to import wallet to MetaMask');
        }
    }

    static async connectMetaMask() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
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
}

export default WalletService; 