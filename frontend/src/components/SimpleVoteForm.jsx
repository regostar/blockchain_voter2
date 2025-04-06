import React, { useState, useEffect } from 'react';
import { Button, Card, Select, message, Typography, Alert } from 'antd';
import { BrowserProvider, Contract } from 'ethers';
import VotingSystemArtifact from '../contracts/VotingSystem.json';

const { Option } = Select;
const { Title, Text } = Typography;

const SimpleVoteForm = () => {
    const [loading, setLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);

    const candidates = [
        { id: '1', name: 'Candidate 1' },
        { id: '2', name: 'Candidate 2' },
        { id: '3', name: 'Candidate 3' }
    ];

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const initializeContract = async () => {
        try {
            const provider = new BrowserProvider(window.ethereum);
            setProvider(provider);
            
            const network = await provider.getNetwork();
            const signer = await provider.getSigner();
            
            // Get the contract address from environment variable or use a default one
            const contractAddress = process.env.REACT_APP_VOTING_CONTRACT_ADDRESS;
            if (!contractAddress) {
                throw new Error('Contract address not found');
            }

            const votingContract = new Contract(
                contractAddress,
                VotingSystemArtifact.abi,
                signer
            );
            
            setContract(votingContract);
            return votingContract;
        } catch (error) {
            console.error('Error initializing contract:', error);
            message.error('Failed to initialize contract');
            return null;
        }
    };

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
                await initializeContract();
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
            await initializeContract();
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

        if (!contract) {
            message.error('Contract not initialized');
            return;
        }

        try {
            setLoading(true);
            
            // Get the current block number for the ballot ID
            const currentBlock = await provider.getBlockNumber();
            const ballotId = currentBlock.toString();
            
            // Create a random voter token (in a real app, this would come from your backend)
            const voterToken = await contract.getAddress() + Date.now().toString();
            
            // Register the voter token first
            console.log('Registering voter token...');
            const registerTx = await contract.registerVoterToken(voterToken);
            await registerTx.wait();
            console.log('Voter token registered');
            
            // Cast the vote
            console.log('Casting vote...');
            const voteTx = await contract.castVote(ballotId, selectedCandidate, voterToken);
            const receipt = await voteTx.wait();
            
            message.success('Vote successfully recorded on the blockchain!');
            console.log('Transaction hash:', voteTx.hash);
            console.log('Block number:', receipt.blockNumber);
        } catch (error) {
            console.error('Error:', error);
            message.error(error.message || 'Failed to cast vote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 600, margin: '20px auto', padding: '20px' }}>
            <Title level={3}>Cast Your Vote</Title>

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
                <Button
                    type="primary"
                    onClick={connectWallet}
                    loading={loading}
                    style={{ width: '100%', marginBottom: 20 }}
                >
                    Connect Wallet
                </Button>
            ) : (
                <>
                    <Alert
                        message="Wallet Connected"
                        description={`Connected Address: ${account}`}
                        type="success"
                        showIcon
                        style={{ marginBottom: 20 }}
                    />
                    
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
                                    {candidate.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        onClick={handleVote}
                        loading={loading}
                        style={{ width: '100%' }}
                    >
                        Cast Vote
                    </Button>
                </>
            )}
        </Card>
    );
};

export default SimpleVoteForm; 