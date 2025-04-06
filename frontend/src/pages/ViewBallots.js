import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { votingAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Typography, Card, Row, Col, Button, Spin, Alert, Tag, Empty, Divider } from 'antd';
import { CalendarOutlined, TeamOutlined, CheckCircleOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ViewBallots = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchBallots = async () => {
      try {
        setLoading(true);
        const response = await votingAPI.getBallots();
        console.log('Ballots received:', response.data);
        setBallots(response.data);
      } catch (err) {
        console.error('Error fetching ballots:', err);
        setError('Failed to load ballots. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBallots();
  }, []);

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

  // Get border color based on ballot status
  const getBorderColor = (ballot) => {
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
        <Paragraph className="mt-3">Loading ballots...</Paragraph>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div style={{
        background: 'linear-gradient(135deg, rgba(118, 185, 0, 0.05) 0%, rgba(118, 185, 0, 0.1) 100%)',
        borderRadius: '12px',
        padding: '30px 20px',
        marginBottom: '30px'
      }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Title level={2} style={{ margin: 0 }}>Active Ballots</Title>
          {isAdmin && (
            <Link to="/create-ballot">
              <Button type="primary" size="large">
                Create New Ballot
              </Button>
            </Link>
          )}
        </div>

        <Paragraph>
          View and participate in secure blockchain-based voting ballots. Your vote is securely recorded on the blockchain.
        </Paragraph>
      </div>

      {error && <Alert message="Error" description={error} type="error" showIcon style={{ marginBottom: '20px' }} />}

      {ballots.length === 0 ? (
        <Empty
          description={
            <>
              <Text>No ballots available yet.</Text>
              {isAdmin && <Text> Create one by clicking the button above.</Text>}
            </>
          }
        />
      ) : (
        <>
          {ballots.some(b => isBallotActive(b)) && (
            <>
              <Title level={4} style={{ marginTop: '20px', marginBottom: '16px' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                Active Ballots
              </Title>
              <Row gutter={[24, 24]}>
                {ballots.filter(ballot => isBallotActive(ballot)).map((ballot) => (
                  <Col xs={24} sm={12} lg={8} key={ballot.id}>
                    <Link to={`/ballots/${ballot.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable
                        className="ballot-card"
                        style={{
                          height: '100%',
                          borderTop: `4px solid ${getBorderColor(ballot)}`,
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          {getBallotStatusBadge(ballot)}
                          <Tag icon={<TeamOutlined />} color="blue">{ballot.candidates.length} candidates</Tag>
                        </div>

                        <Title level={4} style={{ marginBottom: '12px' }}>{ballot.title}</Title>
                        <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: '16px' }}>
                          {ballot.description}
                        </Paragraph>

                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <CalendarOutlined style={{ marginRight: '8px', color: '#76B900' }} />
                            <Text type="secondary">Start: {formatDate(ballot.startDate)}</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarOutlined style={{ marginRight: '8px', color: '#E74C3C' }} />
                            <Text type="secondary">End: {formatDate(ballot.endDate)}</Text>
                          </div>
                        </div>

                        <Button type="primary" block>
                          Vote Now <RightOutlined />
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </>
          )}

          {ballots.some(b => !isBallotActive(b)) && (
            <>
              <Divider orientation="left" style={{ marginTop: '30px' }}>Other Ballots</Divider>
              <Row gutter={[24, 24]}>
                {ballots.filter(ballot => !isBallotActive(ballot)).map((ballot) => (
                  <Col xs={24} sm={12} lg={8} key={ballot.id}>
                    <Link to={`/ballots/${ballot.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable
                        className="ballot-card"
                        style={{
                          height: '100%',
                          borderTop: `4px solid ${getBorderColor(ballot)}`,
                          borderRadius: '8px',
                          transition: 'all 0.3s ease',
                          opacity: '0.85',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                          {getBallotStatusBadge(ballot)}
                          <Tag icon={<TeamOutlined />} color="blue">{ballot.candidates.length} candidates</Tag>
                        </div>

                        <Title level={4} style={{ marginBottom: '12px' }}>{ballot.title}</Title>
                        <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: '16px' }}>
                          {ballot.description}
                        </Paragraph>

                        <div style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <CalendarOutlined style={{ marginRight: '8px', color: '#76B900' }} />
                            <Text type="secondary">Start: {formatDate(ballot.startDate)}</Text>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CalendarOutlined style={{ marginRight: '8px', color: '#E74C3C' }} />
                            <Text type="secondary">End: {formatDate(ballot.endDate)}</Text>
                          </div>
                        </div>

                        <Button ghost type="primary" block>
                          View Details <RightOutlined />
                        </Button>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </>
      )}

      <style jsx>{`
        .ballot-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default ViewBallots; 