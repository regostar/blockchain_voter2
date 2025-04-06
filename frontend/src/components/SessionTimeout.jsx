import React, { useState, useEffect } from 'react';
import { Modal, Button, Progress } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const WARNING_TIME = 60000; // Show warning 1 minute before timeout
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 minutes

const SessionTimeout = () => {
    const { user, logout, resetSessionTimer } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(WARNING_TIME);
    const [warningInterval, setWarningInterval] = useState(null);

    useEffect(() => {
        if (!user) return;

        const checkSessionTimeout = () => {
            const lastActivity = sessionStorage.getItem('lastActivity');
            if (lastActivity) {
                const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
                const timeUntilTimeout = SESSION_TIMEOUT - timeSinceLastActivity;

                if (timeUntilTimeout <= WARNING_TIME && !showWarning) {
                    startWarningCountdown(timeUntilTimeout);
                }
            }
        };

        const intervalId = setInterval(checkSessionTimeout, 1000);
        return () => clearInterval(intervalId);
    }, [user, showWarning]);

    const startWarningCountdown = (initialTime) => {
        setShowWarning(true);
        setTimeLeft(initialTime);

        const interval = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1000) {
                    clearInterval(interval);
                    logout();
                    return 0;
                }
                return prevTime - 1000;
            });
        }, 1000);

        setWarningInterval(interval);
    };

    const handleExtendSession = () => {
        if (warningInterval) {
            clearInterval(warningInterval);
        }
        setShowWarning(false);
        resetSessionTimer();
    };

    const handleLogout = () => {
        if (warningInterval) {
            clearInterval(warningInterval);
        }
        logout();
    };

    return (
        <Modal
            title="Session Timeout Warning"
            open={showWarning}
            closable={false}
            maskClosable={false}
            footer={[
                <Button key="logout" danger onClick={handleLogout}>
                    Logout Now
                </Button>,
                <Button key="extend" type="primary" onClick={handleExtendSession}>
                    Extend Session
                </Button>,
            ]}
        >
            <div style={{ textAlign: 'center' }}>
                <h3>Your session is about to expire!</h3>
                <p>You will be logged out in {Math.ceil(timeLeft / 1000)} seconds.</p>
                <Progress
                    percent={Math.round((timeLeft / WARNING_TIME) * 100)}
                    status="active"
                    showInfo={false}
                />
                <p>Would you like to extend your session?</p>
            </div>
        </Modal>
    );
};

export default SessionTimeout; 