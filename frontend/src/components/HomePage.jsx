import React from 'react';
import { Typography, Card, Row, Col, Button, Space } from 'antd';
import { LockOutlined, SafetyOutlined, CheckCircleOutlined, BlockOutlined, GlobalOutlined, SecurityScanOutlined, FileProtectOutlined } from '@ant-design/icons';
import BlockchainAnimation from './BlockchainAnimation.jsx';
import '../App.css';

const { Title, Paragraph } = Typography;

const HomePage = () => {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="hero-section" style={{
                background: `linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(30, 30, 30, 0.8) 100%) center center / cover, url(https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)`,
                color: 'white',
                padding: '150px 20px',
                textAlign: 'center',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
                    <Title style={{ color: 'white', fontSize: '3.2rem', marginBottom: '25px', fontWeight: 'bold' }}>
                        <span className="text-primary">Votely</span> - Secure Blockchain Voting
                    </Title>
                    <Paragraph style={{ fontSize: '1.3rem', maxWidth: '800px', margin: '0 auto 50px', opacity: 0.9, color: 'white' }}>
                        A revolutionary platform that combines cutting-edge blockchain technology with secure voting processes to ensure transparency, integrity, and trust in democratic elections.
                    </Paragraph>
                    <Space size="large" className="hero-buttons">
                        <Button
                            type="primary"
                            size="large"
                            style={{
                                height: '55px',
                                padding: '0 38px',
                                fontSize: '17px',
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}
                        >
                            <a href="/register" style={{ color: 'white' }}>Get Started</a>
                        </Button>
                        <Button
                            ghost
                            size="large"
                            style={{
                                height: '55px',
                                padding: '0 38px',
                                fontSize: '17px',
                                borderRadius: '8px',
                                borderWidth: '2px',
                                display: 'inline-block'
                            }}
                        >
                            <a href="/login" style={{ color: 'white' }}>Login</a>
                        </Button>
                    </Space>
                </div>
            </div>

            <div style={{
                padding: '80px 20px',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 1), rgba(240, 240, 240, 0.5))'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    {/* Interactive Animation Section */}
                    <div className="section-title">
                        <Title level={2} className="text-primary">How Votely Works</Title>
                        <Paragraph style={{ fontSize: '17px', maxWidth: '800px', margin: '0 auto' }}>
                            Our system uses blockchain technology to create a transparent yet private voting process that's impossible to manipulate
                        </Paragraph>
                    </div>

                    <div style={{ margin: '60px 0' }}>
                        <BlockchainAnimation />
                    </div>

                    {/* Key Features Section */}
                    <div className="feature-section" style={{
                        background: 'linear-gradient(135deg, rgba(118, 185, 0, 0.05), rgba(118, 185, 0, 0.02))',
                        padding: '60px 20px',
                        borderRadius: '16px',
                        margin: '40px 0'
                    }}>
                        <div className="section-title">
                            <Title level={2} className="text-primary">Key Features</Title>
                        </div>

                        <Row gutter={[32, 32]}>
                            <Col xs={24} md={8}>
                                <Card className="feature-card" hoverable>
                                    <div style={{ textAlign: 'center' }}>
                                        <SecurityScanOutlined className="feature-icon" />
                                        <Title level={3} className="text-primary">Immutable Records</Title>
                                        <Paragraph style={{ fontSize: '16px' }}>
                                            Once recorded on the blockchain, votes cannot be altered or deleted, ensuring complete integrity of the electoral process.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="feature-card" hoverable>
                                    <div style={{ textAlign: 'center' }}>
                                        <GlobalOutlined className="feature-icon" />
                                        <Title level={3} className="text-primary">Transparency</Title>
                                        <Paragraph style={{ fontSize: '16px' }}>
                                            All transactions are public and can be verified by anyone, while sophisticated cryptography keeps individual votes anonymous.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} md={8}>
                                <Card className="feature-card" hoverable>
                                    <div style={{ textAlign: 'center' }}>
                                        <FileProtectOutlined className="feature-icon" />
                                        <Title level={3} className="text-primary">Security</Title>
                                        <Paragraph style={{ fontSize: '16px' }}>
                                            Advanced cryptographic techniques ensure votes are secure, resistant to tampering, and protected from unauthorized access.
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                        </Row>
                    </div>

                    {/* Process Section */}
                    <div className="feature-section" style={{
                        background: 'linear-gradient(to right, rgba(30, 30, 30, 0.03), rgba(30, 30, 30, 0.05), rgba(30, 30, 30, 0.03))',
                        padding: '60px 20px',
                        borderRadius: '16px',
                        margin: '60px 0'
                    }}>
                        <div className="section-title">
                            <Title level={2} className="text-primary">The Voting Process</Title>
                        </div>

                        <Card className="card" style={{
                            background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.05)'
                        }}>
                            <Row gutter={[32, 32]} style={{ padding: '30px' }}>
                                <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center' }}>
                                    <img
                                        src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                        alt="Secure Voting Process"
                                        style={{
                                            width: '100%',
                                            borderRadius: '12px',
                                            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
                                            filter: 'brightness(1.03)'
                                        }}
                                    />
                                </Col>
                                <Col xs={24} md={12}>
                                    <div className="process-step">
                                        <div className="process-icon">
                                            <LockOutlined className="text-primary" />
                                        </div>
                                        <div className="process-content">
                                            <Title level={4}>Register</Title>
                                            <Paragraph>
                                                Create your account and receive a unique blockchain wallet address that will be used for voting. Your identity is verified while maintaining your privacy.
                                            </Paragraph>
                                        </div>
                                    </div>
                                    <div className="process-step">
                                        <div className="process-icon">
                                            <SafetyOutlined className="text-primary" />
                                        </div>
                                        <div className="process-content">
                                            <Title level={4}>Verify</Title>
                                            <Paragraph>
                                                Your identity is securely verified using advanced authentication methods to ensure one person, one vote principles are maintained.
                                            </Paragraph>
                                        </div>
                                    </div>
                                    <div className="process-step">
                                        <div className="process-icon">
                                            <CheckCircleOutlined className="text-primary" />
                                        </div>
                                        <div className="process-content">
                                            <Title level={4}>Vote</Title>
                                            <Paragraph>
                                                Cast your vote securely on the blockchain. Your vote is encrypted and cannot be traced back to you, ensuring complete privacy.
                                            </Paragraph>
                                        </div>
                                    </div>
                                    <div className="process-step">
                                        <div className="process-icon">
                                            <BlockOutlined className="text-primary" />
                                        </div>
                                        <div className="process-content">
                                            <Title level={4}>Verification</Title>
                                            <Paragraph>
                                                Your vote is verified by the network and added to the blockchain, creating a permanent and immutable record.
                                            </Paragraph>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>

                    {/* CTA Section */}
                    <div style={{
                        textAlign: 'center',
                        margin: '80px 0 40px',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, rgba(118, 185, 0, 0.1), rgba(118, 185, 0, 0.05), rgba(118, 185, 0, 0.03))',
                        borderRadius: '16px',
                        boxShadow: '0 10px 30px rgba(118, 185, 0, 0.05)'
                    }}>
                        <Title level={2}>Ready to Transform Voting with Votely?</Title>
                        <Paragraph style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto 40px' }}>
                            Join thousands of organizations already using Votely to ensure secure, transparent elections.
                        </Paragraph>
                        <Button type="primary" size="large" style={{
                            height: '55px',
                            padding: '0 45px',
                            fontSize: '17px',
                            borderRadius: '8px',
                            background: 'linear-gradient(45deg, #76B900, #68a500)',
                            boxShadow: '0 8px 15px rgba(118, 185, 0, 0.2)'
                        }}>
                            <a href="/register" style={{ color: 'white' }}>Get Started Now</a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage; 