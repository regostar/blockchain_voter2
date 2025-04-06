import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  walletAddress: string;
  privateKey: string;
  isVerified: boolean;
  message: string;
}

const Register: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<RegisterResponse | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post<RegisterResponse>('http://localhost:5000/api/auth/register', {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName
      });

      setRegistrationSuccess(response.data);
      
      // Store only necessary user data
      const userData = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        walletAddress: response.data.walletAddress,
        isVerified: response.data.isVerified
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Don't automatically navigate - show the wallet info first
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    navigate('/login');
  };

  if (registrationSuccess) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px' }}>
        <Card>
          <Title level={2}>Registration Successful!</Title>
          <div style={{ marginBottom: '20px' }}>
            <Text>Please save your wallet information securely:</Text>
          </div>
          <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '15px', borderRadius: '4px' }}>
            <Text strong>Wallet Address:</Text>
            <Text copyable>{registrationSuccess.walletAddress}</Text>
          </div>
          <div style={{ marginBottom: '20px', background: '#fff1f0', padding: '15px', borderRadius: '4px' }}>
            <Text strong type="danger">Private Key (SAVE THIS SECURELY):</Text>
            <Text copyable type="danger">{registrationSuccess.privateKey}</Text>
            <div style={{ marginTop: '10px' }}>
              <Alert
                message="Warning"
                description="This is the only time you will see your private key. Save it in a secure location. You will need it to verify your wallet and vote."
                type="warning"
                showIcon
              />
            </div>
          </div>
          <Button type="primary" onClick={handleContinue} block>
            Continue to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <Spin spinning={loading} tip="Creating your account and wallet...">
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
        <Title level={2}>Register</Title>
        {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[
              { required: true, message: 'Please input your username!' },
              { min: 3, message: 'Username must be at least 3 characters!' }
            ]}
          >
            <Input placeholder="Enter your username" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter your email" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[
              { required: true, message: 'Please input your full name!' }
            ]}
          >
            <Input placeholder="Enter your full name" disabled={loading} />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter your password" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
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
            <Input.Password placeholder="Confirm your password" disabled={loading} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
              Register
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center' }}>
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </Spin>
  );
};

export default Register; 