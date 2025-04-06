import React, { useState, useEffect } from 'react';
import { Card, Typography, Statistic, Row, Col, Spin, message } from 'antd';
import { ethers } from 'ethers';

const { Title, Text } = Typography;

// Hardcoded candidate addresses from Ganache
const CANDIDATES = [
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

const MyVotes = () => {
    const [loading, setLoading] = useState(true);
    const [voteCounts, setVoteCounts] = useState({});
    const [walletAddress, setWalletAddress] = useState(null);
    const [allTransactions, setAllTransactions] = useState([]);

    const fetchVoteCounts = async () => {
        try {
            setLoading(true);

            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            const walletAddress = accounts[0];
            setWalletAddress(walletAddress);

            // Get the latest block number
            const latestBlock = await provider.getBlockNumber();
            console.log('%c=== Blockchain Status ===', 'color: #2196F3; font-weight: bold');
            console.log('Latest block:', latestBlock);
            console.log('Connected wallet:', walletAddress);

            let transactions = [];

            // Iterate through all blocks
            for (let blockNumber = 0; blockNumber <= latestBlock; blockNumber++) {
                const block = await provider.getBlock(blockNumber);

                if (!block) continue;

                console.log(
                    `%c=== Block #${block.number} ===`,
                    'color: #4CAF50; font-weight: bold'
                );
                console.log('Block hash:', block.hash);
                console.log('Timestamp:', new Date(block.timestamp * 1000).toLocaleString());

                // Get full transaction details for this block
                const txPromises = block.transactions.map(txHash =>
                    provider.getTransaction(txHash)
                );
                const blockTxs = await Promise.all(txPromises);

                console.log('Number of transactions:', blockTxs.length);

                // Format transactions from this block
                const formattedTxs = blockTxs.map(tx => ({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value),
                    nonce: tx.nonce,
                    blockNumber: tx.blockNumber,
                    timestamp: block.timestamp
                }));

                if (formattedTxs.length > 0) {
                    console.log('%cBlock Transactions:', 'color: #FF9800; font-weight: bold');
                    formattedTxs.forEach((tx, index) => {
                        console.log(`${index + 1}. Hash: ${tx.hash}`);
                        console.log(`   From: ${tx.from}`);
                        console.log(`   To: ${tx.to}`);
                        console.log(`   Value: ${tx.value} ETH`);
                        console.log(`   Nonce: ${tx.nonce}`);
                        console.log('------------------------');
                    });
                }

                transactions = [...transactions, ...formattedTxs];
            }

            console.log('%c=== Vote Analysis ===', 'color: #9C27B0; font-weight: bold');
            console.log('Total transactions found:', transactions.length);

            // Filter transactions for value transfers (0.01 ETH) to candidate addresses
            const voteTransactions = transactions.filter(tx => {
                const isCandidate = CANDIDATES.some(c =>
                    c.address.toLowerCase() === tx.to?.toLowerCase()
                );
                const isVoteAmount = parseFloat(tx.value) === 0.01;
                return isCandidate && isVoteAmount;
            });

            console.log('Vote transactions found:', voteTransactions.length);
            if (voteTransactions.length > 0) {
                console.log('%cVote Details:', 'color: #E91E63; font-weight: bold');
                voteTransactions.forEach((tx, index) => {
                    const candidate = CANDIDATES.find(c =>
                        c.address.toLowerCase() === tx.to.toLowerCase()
                    );
                    console.log(`${index + 1}. Vote for ${candidate?.name || 'Unknown Candidate'}`);
                    console.log(`   From: ${tx.from}`);
                    console.log(`   Block: ${tx.blockNumber}`);
                    console.log(`   Time: ${new Date(tx.timestamp * 1000).toLocaleString()}`);
                    console.log('------------------------');
                });
            }

            console.log('Vote Transactions:', voteTransactions);

            // Initialize vote counts
            const counts = {};
            for (const candidate of CANDIDATES) {
                counts[candidate.address] = {
                    count: 0,
                    totalEth: '0',
                    name: candidate.name,
                    transactions: []
                };
            }

            // Count votes and store transactions for each candidate
            for (const tx of voteTransactions) {
                const candidateAddress = tx.to.toLowerCase();
                const matchingCandidate = CANDIDATES.find(c =>
                    c.address.toLowerCase() === candidateAddress
                );

                if (matchingCandidate) {
                    counts[matchingCandidate.address].count++;
                    counts[matchingCandidate.address].totalEth =
                        ethers.formatEther(
                            ethers.parseEther(counts[matchingCandidate.address].totalEth) +
                            ethers.parseEther("0.01")
                        );
                    counts[matchingCandidate.address].transactions.push(tx);
                }
            }

            setVoteCounts(counts);
            setAllTransactions(transactions);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching vote counts:', error);
            message.error('Failed to fetch vote counts: ' + error.message);
            setLoading(false);
        }
    };

    // Set up event listener for new blocks
    useEffect(() => {
        const setupBlockListener = async () => {
            try {
                if (!window.ethereum) return;

                const provider = new ethers.BrowserProvider(window.ethereum);

                // Listen for new blocks
                provider.on('block', (blockNumber) => {
                    console.log('New block:', blockNumber);
                    // Refresh vote counts when new block is mined
                    fetchVoteCounts();
                });

                return () => {
                    provider.removeAllListeners('block');
                };
            } catch (error) {
                console.error('Error setting up block listener:', error);
            }
        };

        setupBlockListener();
    }, []);

    // Initial fetch of vote counts
    useEffect(() => {
        fetchVoteCounts();
    }, []);

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={2}>Live Vote Counts</Title>
                <Text type="secondary" style={{ marginBottom: '20px', display: 'block' }}>
                    Connected Wallet: {walletAddress || 'Not Connected'}
                </Text>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Row gutter={16}>
                        {CANDIDATES.map((candidate) => (
                            <Col span={8} key={candidate.address}>
                                <Card>
                                    <Statistic
                                        title={candidate.name}
                                        value={voteCounts[candidate.address]?.count || 0}
                                        suffix="votes"
                                    />
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                        Address: {`${candidate.address.substring(0, 6)}...${candidate.address.substring(candidate.address.length - 4)}`}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                        Total ETH: {voteCounts[candidate.address]?.totalEth || '0'} ETH
                                    </Text>
                                    <div style={{ marginTop: '10px' }}>
                                        <Text strong>Recent Transactions:</Text>
                                        {voteCounts[candidate.address]?.transactions.slice(-3).map((tx, index) => (
                                            <div key={tx.hash} style={{ fontSize: '12px' }}>
                                                <Text type="secondary">
                                                    {new Date(tx.timestamp * 1000).toLocaleString()}: {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default MyVotes; 