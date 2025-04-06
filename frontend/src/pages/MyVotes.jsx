import React from 'react';
import { Typography, Card } from 'antd';

const { Title } = Typography;

const MyVotes = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>My Votes</Title>
      <Card>
        <p>Your voting history will appear here.</p>
      </Card>
    </div>
  );
};

export default MyVotes; 