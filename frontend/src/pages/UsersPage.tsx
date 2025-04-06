import React from 'react';
import { Layout } from 'antd';
import UsersList from '../components/UsersList';

const { Content } = Layout;

const UsersPage: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px', background: '#fff' }}>
        <UsersList />
      </Content>
    </Layout>
  );
};

export default UsersPage; 