import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Spin, Empty, message, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const MyVotes = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [walletAddress, setWalletAddress] = useState(null);
    const { user } = useAuth();

    // Function to get current wallet address from MetaMask
    const getCurrentWalletAddress = async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts && accounts.length > 0) {
                const address = accounts[0];
                console.log('Current wallet address:', address);
                return address;
            }
            throw new Error('No accounts found');
        } catch (error) {
            console.error('Error getting wallet address:', error);
            throw error;
        }
    };

    const fetchVotingTransactions = async () => {
        setLoading(true);
        try {
            // Get current wallet address
            const currentAddress = await getCurrentWalletAddress();
            setWalletAddress(currentAddress);
            console.log('Fetching transactions for address:', currentAddress);

            if (!currentAddress) {
                throw new Error('Wallet address not found');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            // Get current block number
            const currentBlock = await provider.getBlockNumber();
            console.log('Current block:', currentBlock);

            const allTransactions = [];

            // Process blocks sequentially to ensure we get all transaction details
            for (let i = 0; i <= currentBlock; i++) {
                try {
                    const block = await provider.getBlock(i);
                    if (block && block.transactions.length > 0) {
                        console.log(`Processing block ${i} with ${block.transactions.length} transactions`);

                        // Get full transaction details for each transaction in the block
                        for (const txHash of block.transactions) {
                            const tx = await provider.getTransaction(txHash);
                            if (tx) {
                                const fromAddress = tx.from?.toLowerCase();
                                const toAddress = tx.to?.toLowerCase();
                                const currentAddressLower = currentAddress.toLowerCase();

                                if (fromAddress === currentAddressLower || toAddress === currentAddressLower) {
                                    console.log(`Found matching transaction in block ${i}:`, {
                                        hash: tx.hash,
                                        from: tx.from,
                                        to: tx.to
                                    });

                                    const receipt = await provider.getTransactionReceipt(tx.hash);
                                    const value = ethers.formatEther(tx.value || '0');

                                    const transaction = {
                                        key: tx.hash,
                                        blockNumber: block.number,
                                        hash: tx.hash,
                                        from: tx.from,
                                        to: tx.to,
                                        gasUsed: receipt ? receipt.gasUsed.toString() : 'Pending',
                                        value: value,
                                        isContractCall: receipt?.logs?.length > 0,
                                        status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending'
                                    };

                                    console.log('Adding transaction:', transaction);
                                    allTransactions.push(transaction);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error processing block ${i}:`, error);
                }
            }

            console.log('Found transactions:', allTransactions);

            // Sort transactions by block number in descending order
            const sortedTransactions = allTransactions.sort((a, b) => b.blockNumber - a.blockNumber);
            setTransactions(sortedTransactions);

            if (sortedTransactions.length > 0) {
                message.success(`Found ${sortedTransactions.length} transactions`);
            } else {
                message.info('No transactions found for your wallet');
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            message.error('Failed to load transaction history: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Listen for account changes in MetaMask
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('Account changed:', accounts[0]);
                if (accounts[0]) {
                    setWalletAddress(accounts[0]);
                    fetchVotingTransactions();
                }
            });
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => {
                    console.log('Removed account listener');
                });
            }
        };
    }, []);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchVotingTransactions();
    }, []);

    const columns = [
        {
            title: 'Block',
            dataIndex: 'blockNumber',
            key: 'blockNumber',
            width: 80,
        },
        {
            title: 'TX Hash',
            dataIndex: 'hash',
            key: 'hash',
            render: (hash) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography.Text copyable style={{ width: 200 }} ellipsis>
                        {hash}
                    </Typography.Text>
                    {transactions.find(t => t.hash === hash)?.isContractCall && (
                        <Tag color="blue" style={{ marginLeft: '8px' }}>
                            CONTRACT CALL
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'From Address',
            dataIndex: 'from',
            key: 'from',
            render: (address) => (
                <Typography.Text copyable style={{ width: 150 }} ellipsis>
                    {address}
                </Typography.Text>
            ),
        },
        {
            title: 'To Contract Address',
            dataIndex: 'to',
            key: 'to',
            render: (address) => (
                <Typography.Text copyable style={{ width: 150 }} ellipsis>
                    {address}
                </Typography.Text>
            ),
        },
        {
            title: 'Gas Used',
            dataIndex: 'gasUsed',
            key: 'gasUsed',
            width: 100,
            render: (gas) => gas === 'Pending' ? gas : parseInt(gas).toLocaleString(),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            width: 100,
            render: (value) => value + ' ETH',
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 100,
            render: (status) => (
                <Tag color={
                    status === 'Success' ? 'green' :
                        status === 'Failed' ? 'red' :
                            'gold'
                }>
                    {status}
                </Tag>
            ),
        },
    ];

    if (!walletAddress) {
        return (
            <div style={{ padding: '24px' }}>
                <Card>
                    <Empty
                        description={
                            <span>
                                Please connect your wallet to view transactions.
                            </span>
                        }
                    />
                </Card>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <div>
                        <Title level={2} style={{ margin: 0 }}>Transaction History</Title>
                        <Text type="secondary">Wallet: {walletAddress}</Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<ReloadOutlined />}
                        onClick={fetchVotingTransactions}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : transactions.length === 0 ? (
                    <Empty description="No transactions found" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={transactions}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 1300 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default MyVotes; 