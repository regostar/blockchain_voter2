import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin, Card, Typography, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const { Title, Text } = Typography;

const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [isWalletGenerating, setIsWalletGenerating] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    setIsWalletGenerating(true);

    try {
      // Show wallet generation modal
      Modal.info({
        title: 'Generating Your Secure Wallet',
        content: (
          <div>
            <p>Please wait while we generate your secure blockchain wallet...</p>
            <Spin size="large" />
          </div>
        ),
        closable: false,
        maskClosable: false,
        footer: null
      });

      const response = await register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName
      });

      // Verify that we have wallet data before proceeding
      if (!response || !response.walletAddress || !response.privateKey) {
        throw new Error('Wallet generation failed. Please try again.');
      }

      // Close the wallet generation modal
      Modal.destroyAll();

      setRegistrationSuccess(response);
    } catch (err) {
      Modal.destroyAll();
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
      setIsWalletGenerating(false);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '20px' }}>
      {registrationSuccess ? (
        <Card className="card">
          <div className="card-header">
            <Title level={2} className="text-white">Welcome to Votely!</Title>
          </div>
          <div style={{ padding: '20px' }}>
            <Alert
              message="Registration Successful"
              description={
                <>
                  <p>Your account has been created successfully. Your secure blockchain wallet has been generated.</p>
                  <p>Wallet Address: <Text code copyable>{registrationSuccess.walletAddress}</Text></p>
                  {registrationSuccess.privateKey && (
                    <>
                      <p>Private Key: <Text code copyable type="danger">{registrationSuccess.privateKey}</Text></p>
                      <Text type="warning">
                        This is the only time you will see your private key. Please save it in a secure location.
                        You will need it for voting transactions.
                      </Text>
                    </>
                  )}
                </>
              }
              type="success"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <Button type="primary" onClick={handleContinue} style={{ width: '100%' }}>
              Continue to Login
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="card">
          <div className="card-header">
            <Title level={2} className="text-white">Register for Votely</Title>
          </div>
          <div style={{ padding: '20px' }}>
            {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}
            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              disabled={loading || isWalletGenerating}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
              >
                <Input placeholder="Choose a username" />
              </Form.Item>

              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[
                  { required: true, message: 'Please input your full name!' }
                ]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input placeholder="Enter your email" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password placeholder="Create a password" />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm your password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: '100%' }}
                  loading={loading || isWalletGenerating}
                  className="btn-primary"
                >
                  {isWalletGenerating ? 'Generating Wallet...' : 'Register'}
                </Button>
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              Already have an account? <a href="/login" className="text-primary">Login here</a>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Register; 