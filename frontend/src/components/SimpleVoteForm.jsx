import React, { useState, useEffect } from 'react';
import { Button, Card, Select, message, Typography, Alert } from 'antd';
import { BrowserProvider, Contract, id, keccak256, toUtf8Bytes } from 'ethers';
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

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const SimpleVoteForm = () => {
    const [loading, setLoading] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [contract, setContract] = useState(null);
    const [provider, setProvider] = useState(null);
    const [networkError, setNetworkError] = useState(false);
    const [voteCounts, setVoteCounts] = useState({});
    const [ballotId, setBallotId] = useState('1');
    const [hasVoted, setHasVoted] = useState(false);
    const [transactionHash, setTransactionHash] = useState(null);

    const candidates = [
        { id: '1', name: 'Candidate 1' },
        { id: '2', name: 'Candidate 2' },
        { id: '3', name: 'Candidate 3' }
    ];

    const switchToGanacheNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: EXPECTED_CHAIN_ID }],
            });
            setNetworkError(false);
            return true;
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
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

    const initializeContract = async () => {
        try {
            if (!await checkNetwork()) {
                const switched = await switchToGanacheNetwork();
                if (!switched) return null;
            }

            const provider = new BrowserProvider(window.ethereum);
            setProvider(provider);
            
            const signer = await provider.getSigner();
            console.log('Signer address:', await signer.getAddress());
            
            const votingContract = new Contract(
                CONTRACT_ADDRESS,
                VotingSystemArtifact.abi,
                signer
            );
            
            console.log('Contract initialized:', votingContract);
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

    const generateVoterToken = (address) => {
        // Create a hash of the address to use as the voter token
        return keccak256(toUtf8Bytes(address.toLowerCase()));
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

        if (networkError) {
            message.error('Please switch to Ganache network');
            return;
        }

        if (hasVoted) {
            message.error('You have already voted in this ballot');
            return;
        }

        try {
            setLoading(true);
            
            // Get the current block number for the ballot ID
            const currentBlock = await provider.getBlockNumber();
            const ballotId = currentBlock.toString();
            console.log('Using ballot ID:', ballotId);
            
            // Generate voter token from the account address
            const voterToken = generateVoterToken(account);
            console.log('Voter token:', voterToken);
            
            try {
                console.log('Checking if voter is registered...');
                const isRegistered = await contract.registeredVoterTokens(voterToken);
                console.log('Is registered:', isRegistered);
                
                if (!isRegistered) {
                    console.log('Registering voter token...');
                    const registerTx = await contract.registerVoterToken(voterToken, {
                        gasLimit: 100000
                    });
                    console.log('Register transaction:', registerTx);
                    const registerReceipt = await registerTx.wait();
                    console.log('Register receipt:', registerReceipt);
                    console.log('Voter token registered');
                } else {
                    console.log('Voter already registered');
                }
            } catch (registerError) {
                console.error('Error in registration:', registerError);
                // Continue with voting even if registration check fails
            }
            
            // Cast the vote
            console.log('Casting vote with params:', {
                ballotId,
                selectedCandidate,
                voterToken
            });
            
            const voteTx = await contract.castVote(ballotId, selectedCandidate, voterToken, {
                gasLimit: 200000
            });
            
            // Print transaction hash to console first
            console.log('Transaction Hash:', voteTx.hash);
            setTransactionHash(voteTx.hash);
            
            // Show immediate success message
            message.success({
                content: (
                    <div>
                        <p>Vote submitted successfully!</p>
                        <p>Transaction Hash: {voteTx.hash}</p>
                        <p>Waiting for confirmation...</p>
                    </div>
                ),
                duration: 0
            });
            
            console.log('Vote transaction:', voteTx);
            const receipt = await voteTx.wait();
            console.log('Vote receipt:', receipt);
            
            // Update vote counts after transaction is confirmed
            const counts = {};
            for (const candidate of candidates) {
                console.log('Fetching votes for candidate:', candidate.id);
                const count = await contract.candidateVotes(ballotId, candidate.id);
                console.log('Vote count:', count.toString());
                counts[candidate.id] = count.toString();
            }
            setVoteCounts(counts);
            
            // Mark as voted and show final success message
            setHasVoted(true);
            message.success({
                content: (
                    <div>
                        <p>Voting completed!</p>
                        <p>Transaction Hash: {voteTx.hash}</p>
                        <p>Your vote has been recorded on the blockchain.</p>
                    </div>
                ),
                duration: 0
            });
            
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
                        description={
                            <div>
                                <p>Connected Address: {account}</p>
                                <p>Contract Address: {CONTRACT_ADDRESS}</p>
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
                                            {candidate.name}
                                            {voteCounts[candidate.id] && (
                                                <span className="ml-2 text-sm text-gray-500">
                                                    (Votes: {voteCounts[candidate.id]})
                                                </span>
                                            )}
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