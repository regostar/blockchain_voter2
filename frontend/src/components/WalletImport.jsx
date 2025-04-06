import React, { useState } from 'react';
import { Button, Steps, Card, Typography, Alert, List, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { WalletService } from '../services/WalletService';

const { Title, Text } = Typography;

const WalletImport = ({ walletAddress, privateKey }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const importToMetaMask = async () => {
        setLoading(true);
        setError(null);

        try {
            // First check if MetaMask is installed
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed. Please install MetaMask first.');
            }

            // Set a timeout for the entire process
            const timeout = setTimeout(() => {
                setLoading(false);
                setError('Import process timed out. Please try again.');
            }, 30000); // 30 second timeout

            // 1. Setup Ganache Network
            try {
                await WalletService.setupGanacheNetwork();
                message.success('Ganache network setup successful');
            } catch (err) {
                clearTimeout(timeout);
                throw new Error('Failed to setup Ganache network: ' + err.message);
            }

            // 2. Import the wallet
            try {
                await WalletService.importWalletToMetaMask(privateKey);
                message.success('Wallet imported successfully');
            } catch (err) {
                clearTimeout(timeout);
                throw new Error('Failed to import wallet: ' + err.message);
            }

            // 3. Verify the connection
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });

                if (!accounts || accounts.length === 0) {
                    throw new Error('No accounts found after import');
                }

                // Verify the imported address matches
                if (accounts[0].toLowerCase() !== walletAddress.toLowerCase()) {
                    throw new Error('Imported wallet address does not match the expected address');
                }
            } catch (err) {
                clearTimeout(timeout);
                throw new Error('Failed to verify wallet connection: ' + err.message);
            }

            // Clear the timeout if everything succeeded
            clearTimeout(timeout);

            // Update step and show success message
            setCurrentStep(2);
            message.success('Wallet setup completed successfully!');

            // Redirect to profile page after 2 seconds
            setTimeout(() => {
                navigate('/profile');
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to import wallet. Please try again.');
            message.error(err.message || 'Failed to import wallet');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        {
            title: 'Prerequisites',
            content: (
                <List
                    size="small"
                    bordered
                    dataSource={[
                        'Install MetaMask browser extension',
                        'Make sure Ganache is running on localhost:8545',
                        'Save your private key in a secure location'
                    ]}
                    renderItem={item => <List.Item>{item}</List.Item>}
                />
            ),
        },
        {
            title: 'Import Wallet',
            content: (
                <>
                    <Alert
                        message="About Your Voting Wallet"
                        description={
                            <>
                                <Text>During registration, a unique voting wallet was created for you:</Text>
                                <br />
                                <Text strong>Your Wallet Address: </Text>
                                <Text code copyable>{walletAddress}</Text>
                            </>
                        }
                        type="info"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />

                    <Alert
                        message="Ganache Network Setup"
                        description={
                            <List>
                                <List.Item>1. Add the Ganache network to MetaMask</List.Item>
                                <List.Item>2. Switch to the Ganache network</List.Item>
                                <List.Item>3. Import your voting wallet</List.Item>
                            </List>
                        }
                        type="info"
                        showIcon
                    />

                    <Alert
                        message="Security Notice"
                        description={
                            <List>
                                <List.Item>✓ Only import the private key that was generated during your registration</List.Item>
                                <List.Item>✓ Never share your private key with anyone</List.Item>
                                <List.Item>✓ Make sure you're using the official MetaMask extension</List.Item>
                                <List.Item>✓ Keep a backup of your private key in a secure location</List.Item>
                            </List>
                        }
                        type="warning"
                        showIcon
                        style={{ marginTop: '16px' }}
                    />
                </>
            ),
        },
        {
            title: 'Complete',
            content: (
                <Alert
                    message="Success"
                    description="Your voting wallet has been successfully imported to MetaMask and connected to the Ganache network!"
                    type="success"
                    showIcon
                />
            ),
        },
    ];

    return (
        <Card className="wallet-import-card">
            <Steps current={currentStep} items={steps} style={{ marginBottom: '24px' }} />

            <div className="steps-content">
                {steps[currentStep].content}
            </div>

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginTop: '16px' }}
                />
            )}

            <div className="steps-action" style={{ marginTop: '24px', textAlign: 'center' }}>
                {currentStep === 1 && (
                    <Button
                        type="primary"
                        onClick={importToMetaMask}
                        loading={loading}
                        disabled={loading}
                        size="large"
                        style={{ minWidth: '200px' }}
                    >
                        {loading ? 'Importing...' : 'Import to MetaMask'}
                    </Button>
                )}
            </div>

            {loading && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Spin />
                    <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                        Please wait while we set up your wallet...
                    </Text>
                </div>
            )}
        </Card>
    );
};

export default WalletImport; 