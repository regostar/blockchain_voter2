import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  BlockOutlined
} from '@ant-design/icons';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Menu 
      mode="horizontal" 
      theme="dark"
      style={{ 
        padding: '0 20px',
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        fontSize: '16px'
      }}
    >
      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link to="/" style={{ color: '#FFFFFF' }}>Home</Link>
      </Menu.Item>

      {isAuthenticated && (
        <>
          <Menu.Item key="simple-vote" icon={<BlockOutlined />}>
            <Link to="/simple-vote" style={{ color: '#FFFFFF' }}>Simple Vote</Link>
          </Menu.Item>

          <Menu.Item key="ballots" icon={<CheckCircleOutlined />}>
            <Link to="/ballots" style={{ color: '#FFFFFF' }}>Ballots</Link>
          </Menu.Item>

          <Menu.Item key="my-votes" icon={<CheckCircleOutlined />}>
            <Link to="/my-votes" style={{ color: '#FFFFFF' }}>My Votes</Link>
          </Menu.Item>
        </>
      )}

      {isAuthenticated && user?.isAdmin && (
        <Menu.Item key="create-ballot" icon={<PlusOutlined />}>
          <Link to="/create-ballot" style={{ color: '#FFFFFF' }}>Create Ballot</Link>
        </Menu.Item>
      )}

      {isAuthenticated ? (
        <>
          <Menu.Item key="profile" icon={<UserOutlined />} style={{ marginLeft: 'auto' }}>
            <Link to="/profile" style={{ color: '#FFFFFF' }}>{user?.username || 'Profile'}</Link>
          </Menu.Item>
          
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            <Button type="link" onClick={handleLogout} style={{ padding: 0, color: '#FFFFFF' }}>
              Logout
            </Button>
          </Menu.Item>
        </>
      ) : (
        <>
          <Menu.Item key="login" icon={<LoginOutlined />} style={{ marginLeft: 'auto' }}>
            <Link to="/login" style={{ color: '#FFFFFF' }}>Login</Link>
          </Menu.Item>
          
          <Menu.Item key="register" icon={<UserAddOutlined />}>
            <Link to="/register" style={{ color: '#FFFFFF' }}>Register</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );
};

export default Navbar; 