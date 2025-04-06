import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Tag, Spin, Empty, message, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';

const { Title } = Typography;

const MyVotes = () => {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchVotes();
    }, []);

    const fetchVotes = async () => {
        try {
            // Connect to Ganache
            const provider = new ethers.JsonRpcProvider('http://localhost:8545');

            // Get the latest block number
            const latestBlock = await provider.getBlockNumber();

            // Fetch the last few blocks (adjust range as needed)
            const blocks = [];
            for (let i = latestBlock; i >= Math.max(0, latestBlock - 10); i--) {
                const block = await provider.getBlock(i, true);
                if (block && block.transactions.length > 0) {
                    blocks.push(block);
                }
            }

            // Extract and format transactions
            const transactions = [];
            for (const block of blocks) {
                for (const tx of block.transactions) {
                    // Get transaction details
                    const txDetails = await provider.getTransactionReceipt(tx.hash);

                    // Format the transaction data
                    transactions.push({
                        key: tx.hash,
                        blockNumber: block.number,
                        timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                        transactionHash: tx.hash,
                        from: tx.from,
                        to: tx.to,
                        gasUsed: txDetails ? txDetails.gasUsed.toString() : '0',
                        status: txDetails && txDetails.status === 1 ? 'Success' : 'Failed'
                    });
                }
            }

            setVotes(transactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            message.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

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
            width: 180,
        },
        {
            title: 'Transaction Hash',
            dataIndex: 'transactionHash',
            key: 'transactionHash',
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
            width: 100,
        },
        {
            title: 'Status',
            key: 'status',
            dataIndex: 'status',
            width: 100,
            render: (status) => (
                <Tag color={status === 'Success' ? 'green' : 'red'}>
                    {status}
                </Tag>
            ),
        },
    ];

    return (
        <Card className="my-votes-card" style={{ margin: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={2}>Transaction History</Title>
                <Button type="primary" onClick={fetchVotes} icon={<ReloadOutlined />}>
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : votes.length === 0 ? (
                <Empty
                    description="No transactions found"
                    style={{ margin: '50px 0' }}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={votes}
                    rowKey="transactionHash"
                    pagination={{
                        pageSize: 10,
                        position: ['bottomCenter'],
                    }}
                    scroll={{ x: true }}
                />
            )}
        </Card>
    );
};

export default MyVotes; 