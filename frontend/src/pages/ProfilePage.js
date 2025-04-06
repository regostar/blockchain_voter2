import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, message, Tabs } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../utils/api';
import { useLocation } from 'react-router-dom';
import WalletConnector from '../components/WalletConnector';
import '../App.css';

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
    const { user, updateUserData } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const location = useLocation();

    // Check if user was redirected here to complete profile setup
    const needsProfileSetup = location.state?.needsProfileSetup;

    // Get active tab from query params
    const queryParams = new URLSearchParams(location.search);
    const defaultActiveTab = queryParams.get('tab') === 'wallet' ? 'wallet' : 'profile';

    // Set initial form values when user data loads
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                fullName: user.fullName || '',
            });
        }
    }, [user, form]);

    const onFinish = async (values) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            // Only send fields that have changed
            const changedValues = {};
            if (values.fullName !== user.fullName) changedValues.fullName = values.fullName;
            if (values.email !== user.email) changedValues.email = values.email;

            // Only include password if it's not empty
            if (values.password && values.password.trim() !== '') {
                changedValues.password = values.password;
            }

            // Only make API call if there are changes
            if (Object.keys(changedValues).length > 0) {
                await usersAPI.updateUser(user.id, changedValues);

                // Update local user data (except password)
                const { password, ...dataToUpdate } = changedValues;
                updateUserData(dataToUpdate);

                setSuccess(true);
                message.success('Profile updated successfully');
            } else {
                message.info('No changes to save');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
            message.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin />
                <p>Loading user data...</p>
            </div>
        );
    }

    // Update URL when tab changes
    const handleTabChange = (key) => {
        const url = new URL(window.location.href);
        if (key === 'wallet') {
            url.searchParams.set('tab', 'wallet');
        } else {
            url.searchParams.delete('tab');
        }
        window.history.pushState({}, '', url);
    };

    return (
        <div className="content-container">
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
                <Title level={2}>My Votely Profile</Title>

                {needsProfileSetup && (
                    <Alert
                        message="Welcome to Votely!"
                        description="Please complete your profile by setting your full name before continuing."
                        type="info"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />
                )}

                <Tabs defaultActiveKey={defaultActiveTab} onChange={handleTabChange}>
                    <TabPane tab="Profile Information" key="profile">
                        <Card className="card">
                            <div className="card-header">
                                <Title level={3} className="text-white">Personal Information</Title>
                            </div>
                            <div style={{ padding: '20px' }}>
                                {error && <Alert message={error} type="error" style={{ marginBottom: '16px' }} />}
                                {success && <Alert message="Profile updated successfully" type="success" style={{ marginBottom: '16px' }} />}

                                <Form
                                    form={form}
                                    name="profile"
                                    onFinish={onFinish}
                                    layout="vertical"
                                    initialValues={{
                                        username: user.username,
                                        email: user.email,
                                        fullName: user.fullName || '',
                                    }}
                                >
                                    <Form.Item
                                        label="Username"
                                        name="username"
                                    >
                                        <Input disabled />
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
                                        label="New Password (leave blank to keep current)"
                                        name="password"
                                        rules={[
                                            { min: 6, message: 'Password must be at least 6 characters!' }
                                        ]}
                                    >
                                        <Input.Password placeholder="Enter new password" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            className="btn-primary"
                                            style={{ width: '100%' }}
                                        >
                                            Save Changes
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </div>
                        </Card>
                    </TabPane>

                    <TabPane tab="Blockchain Wallet" key="wallet">
                        <WalletConnector />
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default ProfilePage; 