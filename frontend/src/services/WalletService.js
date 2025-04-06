import { ethers, BrowserProvider, Wallet, formatEther } from 'ethers';

class WalletService {
    static GANACHE_NETWORK_PARAMS = {
        chainId: '0x539', // 1337 in hex
        chainName: 'Ganache',
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        },
        rpcUrls: ['http://localhost:8545']
    };

    static async setupGanacheNetwork() {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            // Check if already on Ganache network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId === this.GANACHE_NETWORK_PARAMS.chainId) {
                return; // Already on Ganache network
            }

            // Add Ganache network if not already added
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [this.GANACHE_NETWORK_PARAMS],
                });
            } catch (error) {
                // If network already exists, this error is expected
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }

            // Switch to Ganache network
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.GANACHE_NETWORK_PARAMS.chainId }],
            });
        } catch (error) {
            throw new Error(`Failed to setup Ganache network: ${error.message}`);
        }
    }

    static async importWalletToMetaMask(privateKey) {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        try {
            // Validate private key format
            if (!privateKey.startsWith('0x')) {
                privateKey = '0x' + privateKey;
            }

            // Create wallet instance
            const wallet = new Wallet(privateKey);

            // Request account access
            await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            // Import the account
            await window.ethereum.request({
                method: 'wallet_importPrivateKey',
                params: [privateKey.replace('0x', '')],
            });

            // Switch to the imported account
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{
                    eth_accounts: {}
                }],
            });

            // Verify the account is selected
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts.includes(wallet.address.toLowerCase())) {
                throw new Error('Failed to select the imported account');
            }

            return wallet.address;
        } catch (error) {
            if (error.code === 4001) {
                throw new Error('User rejected the request');
            }
            throw new Error(`Failed to import wallet: ${error.message}`);
        }
    }

    static async verifyConnection(expectedAddress) {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const currentAddress = accounts[0].toLowerCase();
            if (currentAddress !== expectedAddress.toLowerCase()) {
                throw new Error('Connected account does not match the expected address');
            }

            return true;
        } catch (error) {
            throw new Error(`Failed to verify connection: ${error.message}`);
        }
    }

    static async getBalance(address) {
        try {
            const provider = new BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);
            return formatEther(balance);
        } catch (error) {
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }
}

export { WalletService }; 