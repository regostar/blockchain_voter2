import React, { useState, useEffect } from 'react';
import { Button, Card, message, Spin, List, Tag } from 'antd';
import { WalletOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import VotingAppTester from '../../testVotingApp';

const VotingInterface = () => {
    const [votingApp, setVotingApp] = useState(null);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [currentBallot, setCurrentBallot] = useState(null);
    const [votingHistory, setVotingHistory] = useState([]);

    useEffect(() => {
        const app = new VotingAppTester();
        setVotingApp(app);
    }, []);

    const connectWallet = async () => {
        try {
            setLoading(true);
            const success = await votingApp.connectMetaMask();
            if (success) {
                setConnected(true);
                message.success('Wallet connected successfully!');
                // Check registration status
                const registered = await votingApp.checkVoterStatus();
                setIsRegistered(registered);
                if (registered) {
                    // Load ballot and history
                    await loadBallotAndHistory();
                }
            }
        } catch (error) {
            message.error('Failed to connect wallet: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadBallotAndHistory = async () => {
        try {
            setLoading(true);
            // Load current ballot (assuming ballot ID 1)
            const ballot = await votingApp.getBallotDetails(1);
            setCurrentBallot(ballot);

            // Load voting history
            const history = await votingApp.getVotingHistory();
            setVotingHistory(history);
        } catch (error) {
            message.error('Failed to load data: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const castVote = async (candidateId) => {
        try {
            setLoading(true);
            const result = await votingApp.castVote(currentBallot.id, candidateId);
            if (result.success) {
                message.success('Vote cast successfully!');
                // Reload ballot and history
                await loadBallotAndHistory();
            } else {
                message.error('Failed to cast vote: ' + result.error);
            }
        } catch (error) {
            message.error('Error casting vote: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <Spin spinning={loading}>
                <Card title="Blockchain Voting Interface"
                    extra={
                        <Button
                            type="primary"
                            icon={<WalletOutlined />}
                            onClick={connectWallet}
                            disabled={connected}
                        >
                            {connected ? 'Connected' : 'Connect Wallet'}
                        </Button>
                    }>

                    {/* Registration Status */}
                    <div style={{ marginBottom: '20px' }}>
                        <Tag color={isRegistered ? 'green' : 'red'}>
                            {isRegistered ?
                                <><CheckCircleOutlined /> Registered Voter</> :
                                <><CloseCircleOutlined /> Not Registered</>
                            }
                        </Tag>
                    </div>

                    {/* Current Ballot */}
                    {currentBallot && (
                        <Card
                            title="Current Ballot"
                            type="inner"
                            style={{ marginBottom: '20px' }}
                        >
                            <p><strong>Title:</strong> {currentBallot.title}</p>
                            <p><strong>Status:</strong>
                                <Tag color={currentBallot.isActive ? 'green' : 'red'}>
                                    {currentBallot.isActive ? 'Active' : 'Closed'}
                                </Tag>
                            </p>
                            <p><strong>Start:</strong> {new Date(currentBallot.startTime * 1000).toLocaleString()}</p>
                            <p><strong>End:</strong> {new Date(currentBallot.endTime * 1000).toLocaleString()}</p>
                        </Card>
                    )}

                    {/* Voting History */}
                    <Card title="Voting History" type="inner">
                        <List
                            dataSource={votingHistory}
                            renderItem={event => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={`Ballot #${event.args.ballotId.toString()}`}
                                        description={`Voted for candidate ${event.args.candidateId.toString()}`}
                                    />
                                    <div>{new Date(event.args.timestamp * 1000).toLocaleString()}</div>
                                </List.Item>
                            )}
                            locale={{ emptyText: 'No voting history' }}
                        />
                    </Card>
                </Card>
            </Spin>
        </div>
    );
};

export default VotingInterface; 