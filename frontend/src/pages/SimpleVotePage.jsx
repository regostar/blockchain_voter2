import React from 'react';
import { Typography, Alert } from 'antd';
import SimpleVoteForm from '../components/SimpleVoteForm';

const { Title, Paragraph } = Typography;

const SimpleVotePage = () => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <Title>Simple Blockchain Voting</Title>
                <Paragraph>
                    Cast your vote directly on the blockchain. Make sure you have MetaMask installed and connected to the Ganache network.
                </Paragraph>
                
                <Alert
                    message="Setup Required"
                    description={
                        <ul style={{ textAlign: 'left', marginBottom: 0 }}>
                            <li>Install MetaMask browser extension if you haven't already</li>
                            <li>Connect to Ganache network (http://localhost:8545)</li>
                            <li>Make sure you have enough ETH in your account</li>
                        </ul>
                    }
                    type="info"
                    showIcon
                    style={{ maxWidth: 600, margin: '20px auto' }}
                />
            </div>
            
            <SimpleVoteForm />
        </div>
    );
};

export default SimpleVotePage; 