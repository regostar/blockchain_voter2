import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Typography, Modal, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { walletAPI } from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const WalletConnector = () => {
    const { user, updateUserData, resetSessionTimer } = useAuth();
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [walletAddress, setWalletAddress] = useState(null);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);

    useEffect(() => {
        // Check if MetaMask is installed
        const isMetaMaskInstalled = typeof window.ethereum !== 'undefined';
        if (!isMetaMaskInstalled) {
            setError('MetaMask is not installed. Please install MetaMask to use blockchain features.');
        } else {
            // Clear error if MetaMask is installed
            setError(null);
        }

        // Set initial wallet address if available in user profile
        if (user && user.walletAddress) {
            setWalletAddress(user.walletAddress);
            setIsWalletConnected(true);
        }

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);

            // Check if already connected
            checkConnection();
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, [user]);

    const checkConnection = async () => {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                setIsWalletConnected(true);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            // User disconnected their wallet
            setIsWalletConnected(false);
            setWalletAddress(null);
        } else {
            // User changed accounts
            setWalletAddress(accounts[0]);
            setIsWalletConnected(true);
        }
    };

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            const address = accounts[0];
            setWalletAddress(address);
            setIsWalletConnected(true);

            // Try to update wallet address in backend
            if (user && user.id) {
                try {
                    await walletAPI.updateWalletAddress(user.id, { walletAddress: address });
                    // Reset session timer after successful update
                    resetSessionTimer();
                } catch (err) {
                    console.error('Failed to update wallet address in backend:', err);
                }
            }

            setIsConnecting(false);
            return address;
        } catch (err) {
            console.error('Error connecting wallet:', err);
            setError(err.message || 'Failed to connect wallet. Please try again.');
            setIsConnecting(false);
            return null;
        }
    };

    const disconnectWallet = () => {
        // Note: MetaMask doesn't provide a way to programmatically disconnect
        // We can only clear our local state
        setWalletAddress(null);
        setIsWalletConnected(false);
        setTransactionStatus(null);
    };

    const signMessage = async () => {
        if (!isWalletConnected || !walletAddress) {
            setError('Please connect your wallet first.');
            return;
        }

        try {
            setIsConnecting(true);
            setError(null);

            // Get a nonce from the server for verification
            const nonceResponse = await walletAPI.getNonce(user.id);
            const nonce = nonceResponse.data.nonce;

            // Create message to sign
            const message = `Verify your ownership of this wallet for Votely voting system. Nonce: ${nonce}`;

            // Request signature from user
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, walletAddress],
            });

            // Verify signature with backend
            const verificationResponse = await walletAPI.verifyWallet(user.id, {
                signature,
                walletAddress,
                message,
            });

            if (verificationResponse.data.success) {
                // Update user data with verified wallet status
                const updatedUserData = {
                    ...user,
                    walletAddress: verificationResponse.data.walletAddress,
                    isVerified: verificationResponse.data.isVerified
                };

                // Update the user context and reset session timer
                updateUserData(updatedUserData);
                resetSessionTimer();

                setIsModalVisible(true);
                setTransactionStatus({
                    status: 'success',
                    message: 'Your wallet has been successfully verified!',
                });

                message.success('Wallet verified successfully!');
            } else {
                throw new Error('Wallet verification failed.');
            }
        } catch (err) {
            console.error('Error signing message:', err);
            setError(err.message || 'Failed to verify wallet. Please try again.');
            setTransactionStatus({
                status: 'error',
                message: 'Wallet verification failed.',
            });
            message.error('Failed to verify wallet: ' + (err.message || 'Unknown error'));
        } finally {
            setIsConnecting(false);
        }
    };

    // Add a new function to help users add the Ganache network to MetaMask
    const addGanacheNetwork = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed.');
            }

            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0x539', // 1337 in decimal
                        chainName: 'Ganache Local',
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18,
                        },
                        rpcUrls: ['http://localhost:8545'],
                        blockExplorerUrls: null,
                    },
                ],
            });
            message.success('Ganache network successfully added to MetaMask!');
        } catch (err) {
            console.error('Error adding Ganache network:', err);
            setError('Failed to add Ganache network. ' + err.message);
        }
    };

    return (
        <Card className="card">
            <div className="card-header">
                <Title level={2} className="text-white">Connect Your Wallet</Title>
            </div>
            <div style={{ padding: '20px' }}>
                {error && (
                    <Alert
                        message="MetaMask Required"
                        description={
                            <div>
                                <p>{error}</p>
                                <p>To use the blockchain voting features, please install the MetaMask browser extension:</p>
                                <ul>
                                    <li><a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn" target="_blank" rel="noopener noreferrer">Install MetaMask for Chrome/Edge</a></li>
                                    <li><a href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/" target="_blank" rel="noopener noreferrer">Install MetaMask for Firefox</a></li>
                                </ul>
                                <p>After installation, please refresh this page.</p>
                            </div>
                        }
                        type="error"
                        closable
                        style={{ marginBottom: '20px' }}
                    />
                )}

                <Paragraph>
                    To participate in blockchain voting, you need to connect your Ethereum wallet.
                    This allows you to securely sign your votes and record them on the blockchain.
                </Paragraph>

                {window.ethereum && !isWalletConnected && (
                    <Card title="Setup Instructions" style={{ marginBottom: '20px' }}>
                        <ol>
                            <li>Make sure Ganache is running on your local machine (port 8545)</li>
                            <li>Add the Ganache network to MetaMask:
                                <Button
                                    type="primary"
                                    size="small"
                                    onClick={addGanacheNetwork}
                                    style={{ marginLeft: '10px' }}
                                >
                                    Add Ganache Network
                                </Button>
                            </li>
                            <li>Connect your MetaMask wallet using the button below</li>
                        </ol>
                    </Card>
                )}

                {isWalletConnected ? (
                    <>
                        <Alert
                            message="Wallet Connected"
                            description={
                                <>
                                    <p>Your wallet is successfully connected.</p>
                                    <Text strong>Address: </Text>
                                    <Text code copyable>{walletAddress}</Text>
                                </>
                            }
                            type="success"
                            showIcon
                            style={{ marginBottom: '20px' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <Button
                                onClick={disconnectWallet}
                                danger
                            >
                                Disconnect Wallet
                            </Button>

                            {user && !user.isVerified && (
                                <Button
                                    type="primary"
                                    onClick={signMessage}
                                    loading={isConnecting}
                                >
                                    Verify Wallet Ownership
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={connectWallet}
                            loading={isConnecting}
                            style={{ width: '100%' }}
                        >
                            Connect MetaMask
                        </Button>

                        {!window.ethereum && (
                            <Paragraph style={{ marginTop: '20px' }}>
                                <Alert
                                    message="MetaMask Not Detected"
                                    description={
                                        <>
                                            <p>To use blockchain features, you need to install the MetaMask browser extension.</p>
                                            <a
                                                href="https://metamask.io/download/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Download MetaMask
                                            </a>
                                        </>
                                    }
                                    type="warning"
                                    showIcon
                                />
                            </Paragraph>
                        )}
                    </div>
                )}

                <Modal
                    title="Wallet Verification"
                    open={isModalVisible}
                    onOk={() => setIsModalVisible(false)}
                    onCancel={() => setIsModalVisible(false)}
                    footer={[
                        <Button key="ok" type="primary" onClick={() => setIsModalVisible(false)}>
                            OK
                        </Button>
                    ]}
                >
                    {transactionStatus && (
                        <Alert
                            message={transactionStatus.status === 'success' ? 'Success' : 'Error'}
                            description={transactionStatus.message}
                            type={transactionStatus.status}
                            showIcon
                        />
                    )}
                </Modal>
            </div>
        </Card>
    );
};

export default WalletConnector; 