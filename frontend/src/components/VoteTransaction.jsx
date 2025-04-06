import React, { useState, useEffect } from 'react';
import { Button, Alert, Typography, Modal, Spin } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { votingAPI } from '../utils/api';

const { Title, Text, Paragraph } = Typography;

const VoteTransaction = ({ ballot, candidateId, onSuccess, onError }) => {
    const { user } = useAuth();
    const [isVoting, setIsVoting] = useState(false);
    const [error, setError] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [metamaskInstalled, setMetamaskInstalled] = useState(true);
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);

    useEffect(() => {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            setMetamaskInstalled(false);
            return;
        }

        // Check if already connected
        checkConnection();

        // Set wallet address from user data if available
        if (user && user.walletAddress) {
            setWalletAddress(user.walletAddress);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);

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
                setWalletConnected(true);
            } else {
                setWalletConnected(false);
            }
        } catch (err) {
            console.error('Error checking connection:', err);
            setWalletConnected(false);
        }
    };

    const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
            // User disconnected their wallet
            setWalletConnected(false);
            setWalletAddress(null);
        } else {
            // User changed accounts
            setWalletAddress(accounts[0]);
            setWalletConnected(true);
        }
    };

    const connectWallet = async () => {
        try {
            setIsVoting(true);
            setError(null);

            // Request account access if needed
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const connectedAddress = accounts[0];

            setWalletAddress(connectedAddress);
            setWalletConnected(true);

            return connectedAddress;
        } catch (err) {
            console.error('Error connecting wallet:', err);
            setError(err.message || 'Failed to connect wallet. Please try again.');
            return null;
        } finally {
            setIsVoting(false);
        }
    };

    const castVote = async () => {
        if (!ballot || !candidateId) {
            setError('Missing ballot or candidate information');
            return;
        }

        try {
            setIsVoting(true);
            setError(null);
            setTransactionStatus(null);

            // Ensure wallet is connected
            if (!walletConnected) {
                const connected = await connectWallet();
                if (!connected) {
                    throw new Error('Please connect your wallet to vote');
                }
            }

            // Prepare vote data
            const voteData = {
                ballotId: ballot.id,
                candidateId: candidateId,
                voterAddress: walletAddress
            };

            // Convert vote data to a message that can be signed
            const message = JSON.stringify(voteData);

            // Open the modal before requesting signature
            setIsModalVisible(true);
            setTransactionStatus({
                status: 'pending',
                message: 'Please sign the transaction in MetaMask to cast your vote...'
            });

            // Request signature from MetaMask
            const signature = await window.ethereum.request({
                method: 'personal_sign',
                params: [message, walletAddress],
            });

            // Now send the vote to the backend with the signature
            const response = await votingAPI.castVote({
                ...voteData,
                signature
            });

            // Handle successful response
            setTransactionStatus({
                status: 'success',
                message: 'Your vote has been successfully recorded on the blockchain!',
                transactionHash: response.data.transactionHash
            });

            // Call the success callback if provided
            if (onSuccess) {
                onSuccess(response.data);
            }
        } catch (err) {
            console.error('Error casting vote:', err);
            const errorMessage = err.message || 'Failed to cast vote. Please try again.';

            setError(errorMessage);
            setTransactionStatus({
                status: 'error',
                message: errorMessage
            });

            // Call the error callback if provided
            if (onError) {
                onError(err);
            }
        } finally {
            setIsVoting(false);
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);

        // If transaction was successful, call onSuccess callback
        if (transactionStatus && transactionStatus.status === 'success' && onSuccess) {
            onSuccess({
                transactionHash: transactionStatus.transactionHash
            });
        }
    };

    // If MetaMask is not installed, show a warning
    if (!metamaskInstalled) {
        return (
            <Alert
                message="MetaMask Required"
                description={
                    <>
                        <p>To cast your vote on the blockchain, you need to install the MetaMask browser extension.</p>
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
        );
    }

    return (
        <>
            <Button
                type="primary"
                size="large"
                onClick={castVote}
                loading={isVoting}
                style={{ width: '100%' }}
                disabled={!ballot || !candidateId}
            >
                Cast Your Vote
            </Button>

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginTop: '16px' }}
                />
            )}

            <Modal
                title="Blockchain Transaction"
                open={isModalVisible}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" type="primary" onClick={handleModalClose}>
                        Close
                    </Button>
                ]}
            >
                {transactionStatus && (
                    <div style={{ textAlign: 'center' }}>
                        {transactionStatus.status === 'pending' ? (
                            <div>
                                <Spin size="large" />
                                <Paragraph style={{ marginTop: '16px' }}>
                                    {transactionStatus.message}
                                </Paragraph>
                            </div>
                        ) : transactionStatus.status === 'success' ? (
                            <div>
                                <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                                <Title level={4} style={{ marginTop: '16px' }}>Vote Successfully Cast!</Title>
                                <Paragraph>
                                    {transactionStatus.message}
                                </Paragraph>
                                {transactionStatus.transactionHash && (
                                    <div style={{ marginTop: '16px', background: '#f8f8f8', padding: '12px', borderRadius: '4px' }}>
                                        <Text strong>Transaction Hash:</Text>
                                        <br />
                                        <Text copyable={{ text: transactionStatus.transactionHash }}>
                                            {transactionStatus.transactionHash.substring(0, 20)}...
                                        </Text>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <WarningOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                                <Title level={4} style={{ marginTop: '16px' }}>Transaction Failed</Title>
                                <Paragraph>
                                    {transactionStatus.message}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default VoteTransaction; 