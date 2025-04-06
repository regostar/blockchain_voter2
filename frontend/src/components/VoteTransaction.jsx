import React, { useState } from 'react';
import { Modal, Steps, Alert, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { useAuth } from '../contexts/AuthContext';

const VoteTransaction = ({ visible, onClose, candidate, electionContract, electionId }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const steps = [
        {
            title: 'Confirm Vote',
            description: 'Confirm your vote for the selected candidate',
        },
        {
            title: 'Sign Transaction',
            description: 'Sign the voting transaction with MetaMask',
        },
        {
            title: 'Complete',
            description: 'Your vote has been recorded',
        },
    ];

    const handleVote = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!window.ethereum) {
                throw new Error('Please install MetaMask to vote');
            }

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Create contract instance
            const contract = new ethers.Contract(
                electionContract.address,
                electionContract.abi,
                signer
            );

            setCurrentStep(1);

            // Send vote transaction
            const tx = await contract.vote(electionId, candidate.id);
            setTxHash(tx.hash);

            // Wait for transaction confirmation
            await tx.wait();

            // Store transaction in user's vote history
            try {
                const voteData = {
                    userId: user.id,
                    electionId: electionId,
                    candidateId: candidate.id,
                    transactionHash: tx.hash,
                    timestamp: new Date().toISOString(),
                };

                const response = await fetch('/api/votes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`,
                    },
                    body: JSON.stringify(voteData),
                });

                if (!response.ok) {
                    throw new Error('Failed to record vote in history');
                }
            } catch (err) {
                console.error('Error storing vote history:', err);
                // Don't throw here as the vote was successful on the blockchain
            }

            setCurrentStep(2);
            message.success('Vote successfully recorded!');

            // Close modal and redirect after 3 seconds
            setTimeout(() => {
                onClose();
                navigate('/my-votes');
            }, 3000);

        } catch (err) {
            console.error('Voting error:', err);
            setError(err.message || 'Failed to submit vote. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Vote Confirmation"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            <Steps current={currentStep} items={steps} style={{ marginBottom: '24px' }} />

            <div style={{ marginBottom: '24px' }}>
                {currentStep === 0 && (
                    <Alert
                        message="Confirm Your Vote"
                        description={
                            <>
                                <p>You are about to vote for:</p>
                                <p><strong>{candidate.name}</strong></p>
                                <p>This action cannot be undone. Please confirm to proceed.</p>
                            </>
                        }
                        type="info"
                        showIcon
                    />
                )}

                {currentStep === 1 && (
                    <Alert
                        message="Transaction in Progress"
                        description="Please sign the transaction in MetaMask to complete your vote."
                        type="warning"
                        showIcon
                    />
                )}

                {currentStep === 2 && (
                    <Alert
                        message="Vote Recorded Successfully!"
                        description={
                            <>
                                <p>Your vote has been successfully recorded on the blockchain.</p>
                                {txHash && (
                                    <p>
                                        Transaction Hash: <br />
                                        <small style={{ wordBreak: 'break-all' }}>{txHash}</small>
                                    </p>
                                )}
                                <p>Redirecting to your vote history...</p>
                            </>
                        }
                        type="success"
                        showIcon
                    />
                )}

                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginTop: '16px' }}
                    />
                )}
            </div>

            <div style={{ textAlign: 'right' }}>
                {currentStep === 0 && (
                    <>
                        <Button onClick={onClose} style={{ marginRight: 8 }}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleVote}
                            loading={loading}
                        >
                            Confirm Vote
                        </Button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default VoteTransaction; 