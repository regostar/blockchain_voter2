import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { votingAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import VoteTransaction from '../components/VoteTransaction';
import { Typography, Card, Row, Col, Button, Spin, Alert, Tag, Radio, Divider, Progress, Statistic, Space, Badge } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined, CheckCircleOutlined, InfoCircleOutlined, LockOutlined, LinkOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const BallotDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ballot, setBallot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [transactionHash, setTransactionHash] = useState(null);

  useEffect(() => {
    const fetchBallot = async () => {
      try {
        setLoading(true);
        const response = await votingAPI.getBallot(id);
        console.log('Ballot data:', response.data);
        setBallot(response.data);
      } catch (err) {
        console.error('Error fetching ballot:', err);
        setError('Failed to load ballot. It may not exist or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchBallot();
  }, [id]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await votingAPI.getBallotResults(id);
      console.log('Ballot results:', response.data);
      setResults(response.data);
      setShowResults(true);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load ballot results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId) => {
    setSelectedCandidate(candidateId);
    setError('');
  };

  const handleVoteSuccess = (data) => {
    console.log('Vote successful:', data);
    setVoteSuccess(true);
    setTransactionHash(data.transactionHash);
    // After a successful vote, show the results
    setTimeout(() => {
      fetchResults();
    }, 1500);
  };

  const handleVoteError = (err) => {
    console.error('Vote error:', err);
    setError(err.message || 'Failed to cast vote. Please try again.');
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Determine if a ballot is active based on dates and isActive flag
  const isBallotActive = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.startDate);
    const endDate = new Date(ballot.endDate);
    return ballot.isActive && now >= startDate && now <= endDate;
  };

  // Get status badge for a ballot
  const getBallotStatusBadge = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.startDate);
    const endDate = new Date(ballot.endDate);

    if (!ballot.isActive) {
      return <Tag color="default">Inactive</Tag>;
    } else if (now < startDate) {
      return <Tag color="blue">Upcoming</Tag>;
    } else if (now > endDate) {
      return <Tag color="red">Closed</Tag>;
    } else {
      return <Tag color="green">Active</Tag>;
    }
  };

  // Get status color for the ballot
  const getStatusColor = (ballot) => {
    const now = new Date();
    const startDate = new Date(ballot.startDate);
    const endDate = new Date(ballot.endDate);

    if (!ballot.isActive) {
      return '#d9d9d9';
    } else if (now < startDate) {
      return '#1890ff';
    } else if (now > endDate) {
      return '#ff4d4f';
    } else {
      return '#52c41a';
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spin size="large" />
        <Paragraph className="mt-3">Loading ballot details...</Paragraph>
      </div>
    );
  }

  if (error && !ballot) {
    return (
      <div className="container py-5">
        <Alert
          message="Error Loading Ballot"
          description={
            <>
              {error}
              <div style={{ marginTop: '16px' }}>
                <Button type="primary" onClick={() => navigate('/ballots')}>
                  <ArrowLeftOutlined /> Back to Ballots
                </Button>
              </div>
            </>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!ballot) {
    return (
      <div className="container py-5">
        <Alert
          message="Ballot Not Found"
          description={
            <>
              The requested ballot could not be found.
              <div style={{ marginTop: '16px' }}>
                <Button type="primary" onClick={() => navigate('/ballots')}>
                  <ArrowLeftOutlined /> Back to Ballots
                </Button>
              </div>
            </>
          }
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const canVote = user && ballot && isBallotActive(ballot) && !voteSuccess && !showResults;
  const statusColor = getStatusColor(ballot);

  return (
    <div className="container py-5">
      <div style={{ marginBottom: '24px' }}>
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/ballots')}
          style={{ marginBottom: '16px' }}
        >
          Back to Ballots
        </Button>

        <Card
          style={{
            background: `linear-gradient(135deg, rgba(118, 185, 0, 0.05) 0%, rgba(118, 185, 0, 0.15) 100%)`,
            borderRadius: '12px',
            borderTop: `4px solid ${statusColor}`,
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <div>
              <Title level={2} style={{ marginBottom: '8px' }}>{ballot.title}</Title>
              <Space>
                {getBallotStatusBadge(ballot)}
                <Badge
                  count={`${ballot.candidates.length} Candidates`}
                  style={{ backgroundColor: '#1890ff' }}
                />
              </Space>
            </div>
            <div>
              <Card
                size="small"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px'
                }}
              >
                <Text type="secondary">Created by</Text>
                <Text strong>Admin</Text>
              </Card>
            </div>
          </div>
        </Card>
      </div>

      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />}

      {voteSuccess && (
        <Alert
          message="Vote Successful"
          description={
            <>
              <p>Your vote has been successfully recorded on the blockchain!</p>
              {transactionHash && (
                <div>
                  <Text strong>Transaction Hash: </Text>
                  <Text code copyable>{transactionHash}</Text>
                </div>
              )}
            </>
          }
          type="success"
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            className="ballot-card"
            style={{
              marginBottom: '24px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Title level={4}>
              <InfoCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Ballot Information
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '24px' }}>
              {ballot.description}
            </Paragraph>

            <Row gutter={16} style={{ textAlign: 'center' }}>
              <Col span={8}>
                <Statistic
                  title="Start Date"
                  value={formatDate(ballot.startDate)}
                  valueStyle={{ fontSize: '14px' }}
                  prefix={<CalendarOutlined style={{ color: '#76B900' }} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="End Date"
                  value={formatDate(ballot.endDate)}
                  valueStyle={{ fontSize: '14px' }}
                  prefix={<CalendarOutlined style={{ color: '#E74C3C' }} />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Status"
                  value={getBallotStatusBadge(ballot)}
                  valueStyle={{ fontSize: '14px', display: 'flex', justifyContent: 'center' }}
                />
              </Col>
            </Row>
          </Card>

          {canVote ? (
            <Card
              className="ballot-card vote-card"
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderTop: '4px solid #52c41a'
              }}
            >
              <Title level={4}>
                <CheckCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                Cast Your Vote
              </Title>
              <Divider />

              <Radio.Group
                onChange={e => handleCandidateSelect(e.target.value)}
                value={selectedCandidate}
                style={{ width: '100%', marginBottom: '24px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {ballot.candidates.map((candidate) => (
                    <Card
                      key={candidate.id}
                      hoverable
                      style={{
                        marginBottom: '12px',
                        borderColor: selectedCandidate === candidate.id ? '#52c41a' : '#d9d9d9',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Radio value={candidate.id} style={{ width: '100%' }}>
                        <div style={{ padding: '8px 0' }}>
                          <Title level={5} style={{ marginBottom: '4px' }}>{candidate.name}</Title>
                          <Text type="secondary">{candidate.description}</Text>
                        </div>
                      </Radio>
                    </Card>
                  ))}
                </Space>
              </Radio.Group>

              {selectedCandidate ? (
                <VoteTransaction
                  ballot={ballot}
                  candidateId={selectedCandidate}
                  onSuccess={handleVoteSuccess}
                  onError={handleVoteError}
                />
              ) : (
                <Alert
                  message="Please select a candidate to vote for"
                  type="info"
                  showIcon
                />
              )}
            </Card>
          ) : showResults ? (
            <Card
              className="ballot-card results-card"
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderTop: '4px solid #1890ff'
              }}
            >
              <Title level={4}>
                <CheckCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                Voting Results
              </Title>
              <Divider />

              {results ? (
                <div>
                  <Paragraph>
                    <Text strong>Total Votes: </Text>
                    <Text>{results.totalVotes}</Text>
                  </Paragraph>

                  <Space direction="vertical" style={{ width: '100%' }}>
                    {results.candidateResults.map((result) => {
                      const candidate = ballot.candidates.find(c => c.id === result.candidateId);
                      const percentage = results.totalVotes > 0
                        ? Math.round((result.votes / results.totalVotes) * 100)
                        : 0;

                      return (
                        <Card
                          key={result.candidateId}
                          style={{
                            marginBottom: '16px',
                            borderRadius: '8px'
                          }}
                        >
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <Title level={5} style={{ margin: 0 }}>{candidate?.name}</Title>
                              <div>
                                <Text strong>{result.votes} votes</Text>
                                <Text type="secondary"> ({percentage}%)</Text>
                              </div>
                            </div>
                            <Text type="secondary">{candidate?.description}</Text>
                          </div>

                          <Progress
                            percent={percentage}
                            status="active"
                            strokeColor={{
                              from: '#76B900',
                              to: '#52c41a',
                            }}
                            style={{ marginBottom: 0 }}
                          />
                        </Card>
                      );
                    })}
                  </Space>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Spin />
                  <Paragraph style={{ marginTop: '16px' }}>Loading results...</Paragraph>
                </div>
              )}
            </Card>
          ) : (
            <Card
              className="ballot-card"
              style={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                textAlign: 'center',
                padding: '30px',
                borderTop: `4px solid ${statusColor}`
              }}
            >
              <div style={{ padding: '20px 0' }}>
                {ballot.isActive ? (
                  <>
                    <Title level={4}>
                      This ballot is {new Date() < new Date(ballot.startDate) ? 'not yet open' : 'now closed'} for voting
                    </Title>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CheckCircleOutlined />}
                      onClick={fetchResults}
                      style={{ marginTop: '20px' }}
                    >
                      View Results
                    </Button>
                  </>
                ) : (
                  <Title level={4}>
                    <LockOutlined style={{ marginRight: '8px' }} />
                    This ballot is currently inactive
                  </Title>
                )}
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="ballot-sidebar-card candidates-card"
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: '24px',
              borderTop: '4px solid #1890ff'
            }}
          >
            <Title level={4}>
              <TeamOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              Candidates
            </Title>
            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              {ballot.candidates.map((candidate) => (
                <Card
                  key={candidate.id}
                  size="small"
                  style={{
                    marginBottom: '12px',
                    borderRadius: '8px'
                  }}
                >
                  <Title level={5} style={{ marginBottom: '4px', fontSize: '16px' }}>{candidate.name}</Title>
                  <Text type="secondary">{candidate.description}</Text>
                </Card>
              ))}
            </Space>

            {!canVote && !showResults && (
              <Button
                type="primary"
                block
                onClick={fetchResults}
                style={{ marginTop: '16px' }}
              >
                View Results
              </Button>
            )}
          </Card>

          {/* Blockchain Information Card */}
          <Card
            className="ballot-sidebar-card blockchain-card"
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              borderTop: '4px solid #76B900'
            }}
          >
            <Title level={4}>
              <LinkOutlined style={{ marginRight: '8px', color: '#76B900' }} />
              Blockchain Info
            </Title>
            <Divider />

            <Paragraph>
              Votes in this ballot are securely recorded on the blockchain, ensuring transparency and integrity.
            </Paragraph>

            {user && !user.walletAddress && (
              <Alert
                message="Wallet Required"
                description="You need to connect your blockchain wallet to vote."
                type="warning"
                showIcon
                style={{ marginBottom: '16px' }}
                action={
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => navigate('/profile?tab=wallet')}
                  >
                    Connect Wallet
                  </Button>
                }
              />
            )}

            {user && user.walletAddress && (
              <div style={{ marginBottom: '16px' }}>
                <Text strong>Your Wallet:</Text><br />
                <Text code copyable style={{ fontSize: '12px' }}>{user.walletAddress}</Text>
              </div>
            )}

            {transactionHash && (
              <div>
                <Text strong>Transaction:</Text><br />
                <Text code copyable style={{ fontSize: '12px' }}>{transactionHash}</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .ballot-card {
          transition: all 0.3s ease;
        }
        .ballot-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
        .vote-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
};

export default BallotDetail; 