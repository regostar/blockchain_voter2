import React, { useState, useEffect } from 'react';
import { Typography, Tooltip } from 'antd';
import { BlockOutlined, LinkOutlined, KeyOutlined, CheckCircleOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const BlockchainAnimation = () => {
    const [step, setStep] = useState(0);
    const [currentBlock, setCurrentBlock] = useState(0);
    const [animating, setAnimating] = useState(false);

    const totalSteps = 5;
    const blocks = [
        { id: 0, data: 'Vote: Candidate A', hash: '0xa18f...' },
        { id: 1, data: 'Vote: Candidate B', hash: '0xb27d...' },
        { id: 2, data: 'Vote: Candidate A', hash: '0xc36e...' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prevStep) => (prevStep + 1) % totalSteps);
            setAnimating(true);

            setTimeout(() => {
                setAnimating(false);
            }, 500);
        }, 5000);

        return () => clearInterval(timer);
    }, [totalSteps]);

    useEffect(() => {
        if (step >= 2) {
            const blockIndex = step - 2;
            if (blockIndex >= 0 && blockIndex < blocks.length) {
                setCurrentBlock(blockIndex);
            }
        }
    }, [step, blocks.length]);

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className={`animation-container slide-in ${animating ? 'slide-out' : ''}`}>
                        <Title level={3} className="text-primary step-title">Cast Your Vote</Title>
                        <div className="vote-creation">
                            <div className="vote-paper">
                                <Text>I vote for: Candidate A</Text>
                                <div className="vote-signature">
                                    <KeyOutlined style={{ fontSize: '24px', color: '#76B900' }} />
                                    <Text>Signed with your private key</Text>
                                </div>
                            </div>
                        </div>
                        <Text className="step-description">Each vote is digitally signed with the voter's private key, ensuring authenticity and non-repudiation</Text>
                    </div>
                );
            case 1:
                return (
                    <div className={`animation-container slide-in ${animating ? 'slide-out' : ''}`}>
                        <Title level={3} className="text-primary step-title">Encryption & Verification</Title>
                        <div className="encryption-visual">
                            <div className="vote-data">I vote for: Candidate A</div>
                            <div className="encryption-arrow">
                                <LockOutlined spin style={{ fontSize: '32px', color: '#76B900' }} />
                            </div>
                            <div className="encrypted-data">0x7a8b9c...</div>
                        </div>
                        <Text className="step-description">Your vote is encrypted and verified by multiple nodes on the network before being added to the blockchain</Text>
                    </div>
                );
            case 2:
            case 3:
            case 4:
                return (
                    <div className={`animation-container slide-in ${animating ? 'slide-out' : ''}`}>
                        <Title level={3} className="text-primary step-title">Secure Blockchain Storage</Title>
                        <div className="blockchain-detailed">
                            {blocks.map((block, index) => (
                                <React.Fragment key={block.id}>
                                    <Tooltip title={`Block ${block.id}: ${block.data}`}>
                                        <div className={`detailed-block ${index <= currentBlock ? 'active-block' : ''}`}>
                                            <div className="block-header">
                                                <BlockOutlined className="block-icon-large" />
                                                <Text strong className="text-white">Block {block.id}</Text>
                                            </div>
                                            <div className="block-content">
                                                <div className="block-data">
                                                    <Text className="text-white">{block.data}</Text>
                                                </div>
                                                <div className="block-hash">
                                                    <Text className="text-white">{block.hash}</Text>
                                                </div>
                                                {index === currentBlock && step === index + 2 && (
                                                    <CheckCircleOutlined className="verify-icon" />
                                                )}
                                            </div>
                                        </div>
                                    </Tooltip>
                                    {index < blocks.length - 1 && (
                                        <div className={`chain-link-detailed ${index < currentBlock ? 'active-link' : ''}`}>
                                            <LinkOutlined />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <Text className="step-description">
                            {step === 2 && "Each vote becomes a transaction in a block, cryptographically linked to previous votes"}
                            {step === 3 && "Once added to the blockchain, votes cannot be altered or deleted"}
                            {step === 4 && "The complete blockchain provides a transparent, immutable record of all votes"}
                        </Text>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="blockchain-animation-detailed">
            {renderStep()}
            <div className="animation-progress">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                        key={index}
                        className={`progress-dot ${index === step ? 'active' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default BlockchainAnimation; 