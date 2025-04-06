import React, { useState } from 'react';
import { Button, Alert, Modal, Steps, Typography, Space, Card, List } from 'antd';
import { WalletOutlined, KeyOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import WalletService from '../services/WalletService';

const { Text, Paragraph, Title } = Typography;
const { Step } = Steps;

const WalletImport = ({ privateKey, walletAddress, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [importing, setImporting] = useState(false);

    const handleImportWallet = async () => {
        setImporting(true);
        setError('');

        try {
            await WalletService.importWalletToMetaMask(privateKey);
            WalletService.storeWalletAddress(walletAddress);
            setCurrentStep(2);
            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setImporting(false);
        }
    };

    const steps = [
        {
            title: 'Prerequisites',
            icon: <WalletOutlined />,
            content: (
                <>
                    <Card className="info-card">
                        <Title level={4}><InfoCircleOutlined /> Setup Requirements</Title>
                        <List
                            size="small"
                            bordered
                            dataSource={[
                                {
                                    title: '1. Install MetaMask',
                                    description: 'Install the MetaMask browser extension to manage your voting wallet.',
                                    action: (
                                        <Button
                                            type="primary"
                                            href="https://metamask.io/download/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            size="small"
                                        >
                                            Install MetaMask
                                        </Button>
                                    )
                                },
                                {
                                    title: '2. Run Ganache',
                                    description: 'Make sure Ganache is running on localhost:8545',
                                }
                            ]}
                            renderItem={item => (
                                <List.Item actions={item.action ? [item.action] : undefined}>
                                    <List.Item.Meta
                                        title={item.title}
                                        description={item.description}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Alert
                        message="Important"
                        description="Make sure Ganache is running before proceeding to the next step."
                        type="warning"
                        showIcon
                        style={{ marginTop: '20px' }}
                    />
                </>
            ),
        },
        {
            title: 'Import Wallet',
            icon: <KeyOutlined />,
            content: (
                <>
                    <Card className="info-card" style={{ marginBottom: '20px' }}>
                        <Title level={4}><InfoCircleOutlined /> About Your Voting Wallet</Title>
                        <Paragraph>
                            During registration, a unique voting wallet was created for you:
                        </Paragraph>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Text strong>Your Wallet Address:</Text><br />
                                <Text code copyable style={{ fontSize: '12px' }}>{walletAddress}</Text>
                            </div>
                            <Alert
                                message="Ganache Network Setup"
                                description={
                                    <div>
                                        When you click "Import to MetaMask", the system will:
                                        <ol>
                                            <li>Add the Ganache network to MetaMask</li>
                                            <li>Switch to the Ganache network</li>
                                            <li>Import your voting wallet</li>
                                        </ol>
                                    </div>
                                }
                                type="info"
                                showIcon
                            />
                        </Space>
                    </Card>

                    <Alert
                        message="Security Notice"
                        description={
                            <>
                                <p>✓ Only import the private key that was just generated during your registration</p>
                                <p>✓ Never share your private key with anyone</p>
                                <p>✓ Make sure you're using the official MetaMask extension</p>
                                <p>✓ Keep a backup of your private key in a secure location</p>
                            </>
                        }
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />

                    <div style={{ textAlign: 'center' }}>
                        <Button
                            type="primary"
                            onClick={handleImportWallet}
                            loading={importing}
                            size="large"
                        >
                            Import to MetaMask
                        </Button>
                    </div>
                </>
            ),
        },
        {
            title: 'Complete',
            icon: <CheckCircleOutlined />,
            content: (
                <>
                    <Alert
                        message="Wallet Imported Successfully"
                        description={
                            <>
                                <p>Your voting wallet has been successfully imported to MetaMask and connected to Ganache.</p>
                                <p>You can now use it to:</p>
                                <ul>
                                    <li>Sign your votes securely</li>
                                    <li>Verify your voting transactions</li>
                                    <li>Track your voting history</li>
                                </ul>
                            </>
                        }
                        type="success"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />
                    <div style={{ textAlign: 'center' }}>
                        <Text strong>Your Voting Wallet Address: </Text><br />
                        <Text code copyable>{walletAddress}</Text>
                    </div>
                </>
            ),
        },
    ];

    const showModal = () => {
        if (!window.ethereum) {
            setCurrentStep(0);
        } else {
            setCurrentStep(1);
        }
        setIsModalVisible(true);
    };

    return (
        <>
            <Button
                type="primary"
                onClick={showModal}
                icon={<WalletOutlined />}
                size="large"
            >
                Import Voting Wallet to MetaMask
            </Button>

            <Modal
                title={
                    <Space>
                        <WalletOutlined />
                        <span>Import Your Voting Wallet to Ganache</span>
                    </Space>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    <Steps current={currentStep} style={{ marginBottom: '24px' }}>
                        {steps.map(step => (
                            <Step key={step.title} title={step.title} icon={step.icon} />
                        ))}
                    </Steps>

                    {error && (
                        <Alert
                            message="Error"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />
                    )}

                    <div style={{ minHeight: '300px', padding: '20px' }}>
                        {steps[currentStep].content}
                    </div>
                </Space>
            </Modal>

            <style jsx>{`
                .info-card {
                    background: #f8f9fa;
                    border: 1px solid #e8e8e8;
                }
            `}</style>
        </>
    );
};

export default WalletImport; 