import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { votingAPI } from '../utils/api';

const CreateBallot = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: true,
    candidates: [{ name: '', description: '' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCandidateChange = (index, e) => {
    const { name, value } = e.target;
    const updatedCandidates = [...formData.candidates];
    updatedCandidates[index] = {
      ...updatedCandidates[index],
      [name]: value
    };
    setFormData({
      ...formData,
      candidates: updatedCandidates
    });
  };

  const addCandidate = () => {
    setFormData({
      ...formData,
      candidates: [...formData.candidates, { name: '', description: '' }]
    });
  };

  const removeCandidate = (index) => {
    if (formData.candidates.length > 1) {
      const updatedCandidates = formData.candidates.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        candidates: updatedCandidates
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a ballot');
      setIsSubmitting(false);
      return;
    }

    // Debug token issue
    console.log('Authentication check:', { 
      isAuthenticated, 
      user: user?.username,
      hasAccessToken: !!localStorage.getItem('accessToken'),
      accessToken: localStorage.getItem('accessToken')?.substring(0, 20) + '...',
    });

    // Basic validation
    if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    if (formData.candidates.some(candidate => !candidate.name)) {
      setError('All candidates must have a name');
      setIsSubmitting(false);
      return;
    }

    try {
      // Format dates to ISO string
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      // Use the API service which already includes token handling
      await votingAPI.createBallot(payload);

      setSuccess('Ballot created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
        candidates: [{ name: '', description: '' }]
      });

      // Redirect to ballots page after short delay
      setTimeout(() => {
        navigate('/ballots');
      }, 2000);
    } catch (err) {
      console.error('Error creating ballot:', err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'Unknown server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your connection or try again later.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error preparing request: ' + err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4 text-center">Create New Ballot</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Ballot Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter ballot title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what this ballot is for"
                rows={3}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                name="isActive"
                label="Make ballot active immediately"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Form.Group>

            <h4 className="mt-4 mb-3">Candidates</h4>
            
            {formData.candidates.map((candidate, index) => (
              <Card className="mb-3 border-light shadow-sm" key={index}>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={11}>
                      <Form.Group className="mb-3">
                        <Form.Label>Candidate Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={candidate.name}
                          onChange={(e) => handleCandidateChange(index, e)}
                          placeholder="Enter candidate name"
                          required
                        />
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Candidate Description</Form.Label>
                        <Form.Control
                          as="textarea"
                          name="description"
                          value={candidate.description}
                          onChange={(e) => handleCandidateChange(index, e)}
                          placeholder="Brief description of the candidate"
                          rows={2}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={1} className="text-center">
                      <Button 
                        variant="outline-danger" 
                        onClick={() => removeCandidate(index)}
                        disabled={formData.candidates.length <= 1}
                      >
                        &times;
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
            
            <div className="text-center mb-4">
              <Button variant="outline-primary" onClick={addCandidate}>
                + Add Another Candidate
              </Button>
            </div>

            <div className="d-grid mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Ballot'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateBallot; 