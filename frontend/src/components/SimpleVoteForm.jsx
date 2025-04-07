import React, { useState, useEffect } from 'react';
import { Button, Card, Select, message, Typography, Alert, Form, Input } from 'antd';
import { BrowserProvider, Contract, parseEther, Wallet } from 'ethers';
import VotingSystemArtifact from '../contracts/VotingSystem.json';

const { Option } = Select;
const { Title, Text } = Typography;

const EXPECTED_CHAIN_ID = '0x539'; // 1337 in hex
const GANACHE_NETWORK_PARAMS = {
    chainId: EXPECTED_CHAIN_ID,
    chainName: 'Ganache Local',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18
    },
    rpcUrls: ['http://localhost:8545'],
};

// Hardcoded candidate addresses from Ganache
const candidates = [
    {
        id: '1',
        name: 'Candidate 1',
        address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    },
    {
        id: '2',
        name: 'Candidate 2',
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'
    },
    {
        id: '3',
        name: 'Candidate 3',
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906'
    }
];

const SimpleVoteForm = () => {
    const [loading, setLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [provider, setProvider] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [transactionHash, setTransactionHash] = useState(null);
    const [registrationForm] = Form.useForm();
    const [isRegistering, setIsRegistering] = useState(false);

    const switchToGanacheNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: EXPECTED_CHAIN_ID }],
            });
            setNetworkError(false);
            return true;
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [GANACHE_NETWORK_PARAMS],
                    });
                    setNetworkError(false);
                    return true;
                } catch (addError) {
                    console.error('Error adding Ganache network:', addError);
                    message.error('Failed to add Ganache network to MetaMask');
                    return false;
                }
            } else {
                console.error('Error switching to Ganache network:', switchError);
                message.error('Failed to switch to Ganache network');
                return false;
            }
        }
    };

    const checkNetwork = async () => {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== EXPECTED_CHAIN_ID) {
                setNetworkError(true);
                return false;
            }
            setNetworkError(false);
            return true;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    };

    useEffect(() => {
        checkIfWalletIsConnected();

        if (window.ethereum) {
            window.ethereum.on('chainChanged', () => {
                checkNetwork();
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('chainChanged', checkNetwork);
            }
        };
    }, []);

    const checkIfWalletIsConnected = async () => {
        try {
            if (!window.ethereum) {
                message.error('Please install MetaMask!');
                return;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                setIsConnected(true);
                const provider = new BrowserProvider(window.ethereum);
                setProvider(provider);
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
        }
    };

    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                message.error('Please install MetaMask!');
                return;
            }

            setLoading(true);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            setIsConnected(true);
            const provider = new BrowserProvider(window.ethereum);
            setProvider(provider);
            message.success('Wallet connected successfully!');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            message.error('Failed to connect wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedCandidate) {
            message.error('Please select a candidate');
            return;
        }

        if (!isConnected) {
            message.error('Please connect your wallet first');
            return;
        }

        if (networkError) {
            message.error('Please switch to Ganache network');
            return;
        }

        if (hasVoted) {
            message.error('You have already voted');
            return;
        }

        try {
            setLoading(true);

            // Find the selected candidate's address
            const candidate = candidates.find(c => c.id === selectedCandidate);
            if (!candidate) {
                throw new Error('Selected candidate not found');
            }

            // Get signer for the transaction
            const signer = await provider.getSigner();

            // Create transaction to send 0.01 ETH to candidate
            const tx = await signer.sendTransaction({
                to: candidate.address,
                value: parseEther("0.01"), // Sending 0.01 ETH as a vote
            });

            console.log('Transaction Hash:', tx.hash);
            setTransactionHash(tx.hash);

            // Show immediate success message
            message.success({
                content: (
                    <div>
                        <p>Vote submitted successfully!</p>
                        <p>Transaction Hash: {tx.hash}</p>
                        <p>Waiting for confirmation...</p>
                    </div>
                ),
                duration: 0
            });

            // Wait for transaction confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // Mark as voted and show final success message
            setHasVoted(true);
            message.success({
                content: (
                    <div>
                        <p>Vote confirmed!</p>
                        <p>Transaction Hash: {tx.hash}</p>
                        <p>Your vote has been recorded on the blockchain.</p>
                    </div>
                ),
                duration: 0
            });

        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Failed to cast vote');
        } finally {
            setLoading(false);
        }
    };

    // Function to create a new wallet and fund it
    const createNewWallet = async () => {
        try {
            setLoading(true);

            // Create a new random wallet
            const newWallet = Wallet.createRandom();
            console.log('New wallet created:', {
                address: newWallet.address,
                privateKey: newWallet.privateKey
            });

            // Connect to Ganache
            const provider = new BrowserProvider('http://127.0.0.1:8545');

            // Get the first Ganache account as funder
            const signer = await provider.getSigner(0);

            // Send 1 ETH to the new wallet
            const tx = await signer.sendTransaction({
                to: newWallet.address,
                value: parseEther("1.0")
            });

            await tx.wait();
            console.log('Funded new wallet with 1 ETH');

            // Add the new account to MetaMask
            try {
                await window.ethereum.request({
                    method: 'wallet_importRawKey',
                    params: [
                        newWallet.privateKey.slice(2), // Remove '0x' prefix
                        'password123' // Optional password
                    ],
                });

                message.success('New wallet imported to MetaMask!');
            } catch (importError) {
                console.error('Error importing to MetaMask:', importError);
                // If automatic import fails, show manual instructions
                message.info({
                    content: (
                        <div>
                            <p>Please add this account to MetaMask manually:</p>
                            <p>Private Key: {newWallet.privateKey}</p>
                        </div>
                    ),
                    duration: 0
                });
            }

            return newWallet;
        } catch (error) {
            console.error('Error creating new wallet:', error);
            message.error('Failed to create new wallet');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values) => {
        try {
            setIsRegistering(true);

            // Create new wallet for the user
            const userWallet = await createNewWallet();

            // Store user details (in a real app, this would go to a backend)
            const userDetails = {
                name: values.name,
                email: values.email,
                walletAddress: userWallet.address
            };

            console.log('User registered:', userDetails);

            // Clear form
            registrationForm.resetFields();

            message.success({
                content: (
                    <div>
                        <p>Registration successful!</p>
                        <p>Your wallet address: {userWallet.address}</p>
                        <p>Please save your private key securely!</p>
                    </div>
                ),
                duration: 0
            });

            // Connect the new wallet
            await connectWallet();

        } catch (error) {
            console.error('Registration error:', error);
            message.error('Failed to register');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Card style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
            <Title level={3}>Blockchain Voting System</Title>

            {!window.ethereum ? (
                <Alert
                    message="MetaMask Required"
                    description={
                        <div>
                            <p>Please install MetaMask to use this voting system.</p>
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Click here to install MetaMask
                            </a>
                        </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginBottom: 20 }}
                />
            ) : !isConnected ? (
                <>
                    <Form
                        form={registrationForm}
                        onFinish={handleRegister}
                        layout="vertical"
                        style={{ marginBottom: 20 }}
                    >
                        <Form.Item
                            name="name"
                            label="Name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isRegistering}
                            style={{ width: '100%', marginBottom: 10 }}
                        >
                            Register & Create Wallet
                        </Button>
                    </Form>

                    <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 20 }}>
                        - OR -
                    </Text>

                    <Button
                        type="default"
                        onClick={connectWallet}
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Connect Existing Wallet
                    </Button>
                </>
            ) : (
                <>
                    <Alert
                        message="Wallet Connected"
                        description={
                            <div>
                                <p>Connected Address: {account}</p>
                            </div>
                        }
                        type="success"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />

                    {networkError && (
                        <Alert
                            message="Wrong Network"
                            description={
                                <div>
                                    <p>Please switch to the Ganache network (Chain ID: 1337)</p>
                                    <Button type="primary" onClick={switchToGanacheNetwork}>
                                        Switch to Ganache
                                    </Button>
                                </div>
                            }
                            type="warning"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                    )}

                    {hasVoted ? (
                        <Alert
                            message="Voting Completed"
                            description={
                                <div>
                                    <p>You have successfully cast your vote!</p>
                                    <p>Transaction Hash: {transactionHash}</p>
                                    <p>Thank you for participating in the election.</p>
                                </div>
                            }
                            type="success"
                            showIcon
                            style={{ marginBottom: 20 }}
                        />
                    ) : (
                        <>
                            <div style={{ marginBottom: 20 }}>
                                <Text>Select a Candidate:</Text>
                                <Select
                                    style={{ width: '100%', marginTop: 8 }}
                                    value={selectedCandidate}
                                    onChange={setSelectedCandidate}
                                    placeholder="Choose a candidate"
                                >
                                    {candidates.map(candidate => (
                                        <Option key={candidate.id} value={candidate.id}>
                                            {candidate.name} ({candidate.address.substring(0, 6)}...{candidate.address.substring(candidate.address.length - 4)})
                                        </Option>
                                    ))}
                                </Select>
                            </div>

                            <Button
                                type="primary"
                                onClick={handleVote}
                                loading={loading}
                                disabled={networkError || hasVoted}
                                style={{ width: '100%' }}
                            >
                                Cast Vote
                            </Button>
                        </>
                    )}
                </>
            )}
        </Card>
    );
};

export default SimpleVoteForm; 