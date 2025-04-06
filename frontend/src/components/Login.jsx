import React, { useState } from 'react';
import { Form, Input, Button, Alert, Spin, Card, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const { Title } = Typography;

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(values.username, values.password);

      // Check if user has set their full name
      // If not, redirect to profile page to complete profile
      if (!user.fullName || user.fullName.trim() === '') {
        navigate('/profile', { state: { needsProfileSetup: true } });
      } else {
        navigate('/'); // Navigate to home page after successful login
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading} tip="Logging in...">
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '20px' }}>
        <Card className="card">
          <div className="card-header">
            <Title level={2} className="text-white">Login to Votely</Title>
          </div>
          <div style={{ padding: '20px' }}>
            {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}
            <Form
              name="login"
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
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password placeholder="Enter your password" disabled={loading} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading} className="btn-primary">
                  Login
                </Button>
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              Don't have an account? <a href="/register" className="text-primary">Register here</a>
            </div>
          </div>
        </Card>
      </div>
    </Spin>
  );
};

export default Login; 