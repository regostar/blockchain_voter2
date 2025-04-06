import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, Button, Layout, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import '../App.css'; // Import our custom CSS

const { Header } = Layout;

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    { key: 'home', label: <Link to="/">Home</Link> },
    ...(isAuthenticated
      ? [
        { key: 'ballots', label: <Link to="/ballots">Ballots</Link> },
        { key: 'my-votes', label: <Link to="/my-votes">My Votes</Link> },
      ]
      : []),
    ...(isAdmin
      ? [
        { key: 'create-ballot', label: <Link to="/create-ballot">Create Ballot</Link> },
        { key: 'admin', label: <Link to="/admin">Admin Dashboard</Link> },
      ]
      : []),
  ];

  const profileMenu = [
    {
      key: 'profile',
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: <span onClick={handleLogout}>Logout</span>,
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Header className="navbar" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div className="navbar-brand">
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          Votely
        </Link>
      </div>

      <div style={{ display: 'flex' }}>
        <Menu
          mode="horizontal"
          items={items}
          style={{ backgroundColor: 'transparent', borderBottom: 'none' }}
          theme="dark"
        />

        {isAuthenticated ? (
          <Dropdown
            menu={{ items: profileMenu }}
            placement="bottomRight"
          >
            <Button type="text" className="text-primary" icon={<UserOutlined />}>
              {user?.username}
            </Button>
          </Dropdown>
        ) : (
          <div>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar; 