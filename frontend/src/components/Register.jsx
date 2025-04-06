import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin, Card, Typography, Divider, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserOutlined, LockOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
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
      Modal.info({
        title: 'Generating Your Secure Wallet',
        content: (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Please wait while we generate your secure blockchain wallet...</p>
          </div>
        ),
        closable: false,
        maskClosable: false,
        footer: null,
        width: 400
      });

      const response = await register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName
      });

      if (!response || !response.walletAddress || !response.privateKey) {
        throw new Error('Wallet generation failed. Please try again.');
      }

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
    <div className="auth-container">
      {registrationSuccess ? (
        <Card className="auth-card">
          <div className="card-header">
            <Title level={2} className="text-white">Welcome to Votely!</Title>
            <Text className="text-white" style={{ opacity: 0.8 }}>
              Your account has been created successfully
            </Text>
          </div>
          <div className="card-content">
            <Alert
              message="Registration Successful"
              description={
                <div>
                  <p>Your secure blockchain wallet has been generated.</p>
                  <div style={{ margin: '16px 0' }}>
                    <Text strong>Wallet Address:</Text>
                    <Text code copyable style={{ display: 'block', marginTop: '8px' }}>
                      {registrationSuccess.walletAddress}
                    </Text>
                  </div>
                  {registrationSuccess.privateKey && (
                    <div style={{ margin: '16px 0' }}>
                      <Text strong>Private Key:</Text>
                      <Text code copyable type="danger" style={{ display: 'block', marginTop: '8px' }}>
                        {registrationSuccess.privateKey}
                      </Text>
                      <Text type="warning" style={{ display: 'block', marginTop: '8px' }}>
                        This is the only time you will see your private key. Please save it in a secure location.
                        You will need it for voting transactions.
                      </Text>
                    </div>
                  )}
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: '24px' }}
            />
            <Button
              type="primary"
              onClick={handleContinue}
              className="auth-button"
              block
            >
              Continue to Login
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="auth-card">
          <div className="card-header">
            <Title level={2} className="text-white">Create Account</Title>
            <Text className="text-white" style={{ opacity: 0.8 }}>
              Join Votely and start voting securely
            </Text>
          </div>
          <div className="card-content">
            {error && (
              <Alert
                message="Registration Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}
            <Form
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="Username"
                />
              </Form.Item>

              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: 'Please input your full name!' }
                ]}
              >
                <Input
                  prefix={<IdcardOutlined className="site-form-item-icon" />}
                  placeholder="Full Name"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email address!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="Email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Password"
                />
              </Form.Item>

              <Form.Item
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
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="Confirm Password"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="auth-button"
                  loading={loading || isWalletGenerating}
                  block
                >
                  {isWalletGenerating ? 'Generating Wallet...' : 'Create Account'}
                </Button>
              </Form.Item>
            </Form>

            <Divider>or</Divider>

            <div className="auth-footer">
              <Text>
                Already have an account?{' '}
                <a href="/login" className="text-primary">
                  Sign in
                </a>
              </Text>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Register; 