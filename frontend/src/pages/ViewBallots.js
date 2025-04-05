import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { votingAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ViewBallots = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

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
      return <Badge bg="secondary">Inactive</Badge>;
    } else if (now < startDate) {
      return <Badge bg="info">Upcoming</Badge>;
    } else if (now > endDate) {
      return <Badge bg="danger">Closed</Badge>;
    } else {
      return <Badge bg="success">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading ballots...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Ballots</h1>
        {isAdmin && (
          <Link to="/create-ballot">
            <Button variant="primary">Create New Ballot</Button>
          </Link>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {ballots.length === 0 ? (
        <Alert variant="info">
          No ballots available yet. {isAdmin && 'Create one by clicking the button above.'}
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {ballots.map((ballot) => (
            <Col key={ballot.id}>
              <Card className="h-100 shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  {getBallotStatusBadge(ballot)}
                  <small>{ballot.candidates.length} candidate(s)</small>
                </Card.Header>
                <Card.Body>
                  <Card.Title>{ballot.title}</Card.Title>
                  <Card.Text className="text-muted small">
                    {ballot.description.length > 100
                      ? `${ballot.description.substring(0, 100)}...`
                      : ballot.description}
                  </Card.Text>
                  <div className="small mb-3">
                    <div><strong>Start:</strong> {formatDate(ballot.startDate)}</div>
                    <div><strong>End:</strong> {formatDate(ballot.endDate)}</div>
                  </div>
                  <div className="d-grid">
                    <Link to={`/ballots/${ballot.id}`}>
                      <Button variant={isBallotActive(ballot) ? "success" : "secondary"} className="w-100">
                        {isBallotActive(ballot) ? 'Vote Now' : 'View Details'}
                      </Button>
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ViewBallots; 