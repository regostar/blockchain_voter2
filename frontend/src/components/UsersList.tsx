import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Card, Typography } from 'antd';

const { Title } = Typography;

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  walletAddress: string;
  isVerified: boolean;
  createdAt: string;
}

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Wallet Address',
      dataIndex: 'walletAddress',
      key: 'walletAddress',
      render: (address: string) => (
        <span style={{ fontFamily: 'monospace' }}>
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not set'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (verified: boolean) => (
        <span style={{ color: verified ? 'green' : 'red' }}>
          {verified ? 'Verified' : 'Not Verified'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <Card>
      <Title level={2}>Users List</Title>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default UsersList; 