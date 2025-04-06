import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Spin, Empty, message, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const MyVotes = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchVotingTransactions = async () => {
        setLoading(true);
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask is not installed');
            }

            const provider = new ethers.BrowserProvider(window.ethereum);

            // Get the network to ensure we're on Ganache
            const network = await provider.getNetwork();
            console.log('Current network:', network);

            if (!user?.walletAddress) {
                throw new Error('Wallet address not found');
            }

            // Get all blocks from the beginning (block 0)
            const currentBlock = await provider.getBlockNumber();
            console.log('Current block:', currentBlock);

            // Get all transactions for the user's address from block 0
            const history = await provider.send('eth_getTransactionsByAddress', [
                user.walletAddress,
                ethers.toQuantity(0), // Start from block 0
                ethers.toQuantity(currentBlock)
            ]);

            console.log('Transaction history:', history);

            // Format transactions
            const formattedTransactions = await Promise.all(
                (history || []).map(async (tx) => {
                    const block = await provider.getBlock(tx.blockNumber);
                    const receipt = await provider.getTransactionReceipt(tx.hash);

                    return {
                        key: tx.hash,
                        blockNumber: parseInt(tx.blockNumber, 16),
                        timestamp: block ? new Date(block.timestamp * 1000).toLocaleString() : 'Pending',
                        hash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        gasUsed: receipt ? receipt.gasUsed.toString() : 'Pending',
                        status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending'
                    };
                })
            );

            setTransactions(formattedTransactions.sort((a, b) => b.blockNumber - a.blockNumber));

            if (formattedTransactions.length > 0) {
                message.success('Transaction history loaded successfully');
            } else {
                message.info('No transactions found');
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
            message.error('Failed to load transaction history: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.walletAddress) {
            fetchVotingTransactions();
        }
    }, [user]);

    const columns = [
        {
            title: 'Block',
            dataIndex: 'blockNumber',
            key: 'blockNumber',
            width: 100,
        },
        {
            title: 'Time',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 200,
        },
        {
            title: 'Transaction Hash',
            dataIndex: 'hash',
            key: 'hash',
            render: (hash) => (
                <Typography.Text copyable style={{ width: 200 }} ellipsis>
                    {hash}
                </Typography.Text>
            ),
        },
        {
            title: 'From',
            dataIndex: 'from',
            key: 'from',
            render: (address) => (
                <Typography.Text copyable style={{ width: 150 }} ellipsis>
                    {address}
                </Typography.Text>
            ),
        },
        {
            title: 'To',
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
            width: 120,
            render: (gas) => gas === 'Pending' ? gas : parseInt(gas).toLocaleString(),
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

    if (!user?.walletAddress) {
        return (
            <div style={{ padding: '24px' }}>
                <Card>
                    <Empty
                        description={
                            <span>
                                Please connect your wallet in your profile page first.
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
                    <Title level={2} style={{ margin: 0 }}>Transaction History</Title>
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
                        scroll={{ x: 1200 }}
                    />
                )}
            </Card>
        </div>
    );
};

export default MyVotes; 