import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { votingAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import VoteTransaction from '../components/VoteTransaction';

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
        <p className="mt-2">Loading ballot details...</p>
      </Container>
    );
  }

  if (error && !ballot) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate('/ballots')}>
              Back to Ballots
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!ballot) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Ballot not found
          <div className="mt-3">
            <Button variant="outline-primary" onClick={() => navigate('/ballots')}>
              Back to Ballots
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const canVote = user && ballot && isBallotActive(ballot) && !voteSuccess && !showResults;

  return (
    <Container className="py-5">
      <div className="mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/ballots')} className="mb-3">
          &larr; Back to Ballots
        </Button>
        <div className="d-flex align-items-center">
          <h1 className="mb-0 me-3">{ballot.title}</h1>
          {getBallotStatusBadge(ballot)}
        </div>
        <p className="text-muted mt-2">Created by: Admin</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {voteSuccess && (
        <Alert variant="success">
          <p>Your vote has been successfully recorded on the blockchain!</p>
          {transactionHash && (
            <p>
              <strong>Transaction Hash:</strong> {transactionHash}
            </p>
          )}
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Ballot Information</Card.Title>
              <p>{ballot.description}</p>
              <div className="d-flex justify-content-between mt-4">
                <div>
                  <strong>Start Date:</strong><br />
                  {formatDate(ballot.startDate)}
                </div>
                <div>
                  <strong>End Date:</strong><br />
                  {formatDate(ballot.endDate)}
                </div>
                <div>
                  <strong>Status:</strong><br />
                  {getBallotStatusBadge(ballot)}
                </div>
              </div>
            </Card.Body>
          </Card>

          {canVote ? (
            <Card>
              <Card.Body>
                <Card.Title>Cast Your Vote</Card.Title>
                <Form>
                  <Form.Group className="mb-4">
                    {ballot.candidates.map((candidate) => (
                      <div key={candidate.id} className="mb-3">
                        <Form.Check
                          type="radio"
                          id={`candidate-${candidate.id}`}
                          name="candidate"
                          label={
                            <div>
                              <strong>{candidate.name}</strong><br />
                              <span className="text-muted">{candidate.description}</span>
                            </div>
                          }
                          onChange={() => handleCandidateSelect(candidate.id)}
                          checked={selectedCandidate === candidate.id}
                        />
                      </div>
                    ))}
                  </Form.Group>

                  {selectedCandidate ? (
                    <VoteTransaction
                      ballot={ballot}
                      candidateId={selectedCandidate}
                      onSuccess={handleVoteSuccess}
                      onError={handleVoteError}
                    />
                  ) : (
                    <Alert variant="info">Please select a candidate to vote for</Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>
          ) : showResults ? (
            <Card>
              <Card.Body>
                <Card.Title>Voting Results</Card.Title>
                {results ? (
                  <div>
                    <div className="mb-3">
                      <strong>Total Votes: {results.totalVotes}</strong>
                    </div>
                    {results.candidateResults.map((result) => (
                      <div key={result.candidateId} className="mb-4">
                        <div className="d-flex justify-content-between">
                          <strong>{result.candidateName}</strong>
                          <span>{result.votes} votes ({Math.round(result.percentage)}%)</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${result.percentage}%` }}
                            aria-valuenow={result.percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No results available yet.</p>
                )}
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body className="text-center p-5">
                {ballot.isActive ? (
                  <div>
                    <h4>This ballot is {new Date() < new Date(ballot.startDate) ? 'not yet open' : 'now closed'} for voting</h4>
                    <Button
                      variant="primary"
                      className="mt-3"
                      onClick={fetchResults}
                    >
                      View Results
                    </Button>
                  </div>
                ) : (
                  <h4>This ballot is currently inactive</h4>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Candidates</Card.Title>
              <div className="list-group mt-3">
                {ballot.candidates.map((candidate) => (
                  <div key={candidate.id} className="list-group-item">
                    <h5>{candidate.name}</h5>
                    <p className="mb-0 text-muted">{candidate.description}</p>
                  </div>
                ))}
              </div>

              {!canVote && !showResults && (
                <div className="d-grid mt-3">
                  <Button
                    variant="outline-primary"
                    onClick={fetchResults}
                  >
                    View Results
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Blockchain Information Card */}
          <Card className="mt-4">
            <Card.Body>
              <Card.Title>Blockchain Information</Card.Title>
              <p className="text-muted">
                Votes are recorded on the Ethereum blockchain using smart contracts, ensuring
                transparency and immutability.
              </p>

              {voteSuccess && transactionHash && (
                <div className="mt-3">
                  <small><strong>Your Transaction Hash:</strong></small>
                  <div className="text-break border rounded p-2 bg-light mt-1">
                    <code>{transactionHash}</code>
                  </div>
                </div>
              )}

              <div className="d-grid mt-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  href="/profile?tab=wallet"
                  as="a"
                >
                  Manage Wallet
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default BallotDetail; 