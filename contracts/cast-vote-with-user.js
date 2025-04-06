const ethers = require('ethers');
const axios = require('axios');
require('dotenv').config();

async function castVoteWithUser(token, ballotId, candidateId) {
    try {
        // Backend API configuration
        const api = axios.create({
            baseURL: 'http://localhost:3000/api',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Get user's voter token and private key
        const voterTokenResponse = await api.post('/auth/get-voter-token');
        const voterToken = voterTokenResponse.data.voterToken;

        // Connect to Ganache
        const provider = new ethers.JsonRpcProvider('http://localhost:8545');
        
        // Get user's private key from the backend
        const privateKeyResponse = await api.get('/users/private-key');
        const privateKey = privateKeyResponse.data.privateKey;
        
        // Create wallet instance with user's private key
        const wallet = new ethers.Wallet(privateKey, provider);
        
        // Contract address from environment variable
        const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
        
        // Contract ABI (we only need the castVote function)
        const contractABI = [
            "function castVote(string memory ballotId, string memory candidateId, string memory voterToken) public returns (bool)"
        ];
        
        // Create contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, wallet);
        
        // Cast the vote
        const tx = await contract.castVote(ballotId, candidateId, voterToken);
        console.log('Transaction sent:', tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        console.log('Vote cast successfully!');

        // Record the vote in the backend
        await api.post('/voting/record-vote', {
            ballotId,
            candidateId,
            transactionHash: tx.hash
        });

        return {
            success: true,
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        };
    } catch (error) {
        console.error('Error casting vote:', error.message);
        throw error;
    }
}

// Example usage:
// castVoteWithUser('user-jwt-token', 'ballot1', 'candidate1')
//   .then(result => console.log(result))
//   .catch(error => console.error('Failed to cast vote:', error));

module.exports = castVoteWithUser; 