const ethers = require('ethers');
require('dotenv').config();

async function castVote() {
    // Connect to Ganache
    const provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Use the first private key from Ganache's deterministic wallet
    const privateKey = '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d';
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Contract address (replace with your deployed contract address)
    const contractAddress = process.env.VOTING_CONTRACT_ADDRESS;
    
    // Contract ABI (we only need the castVote function)
    const contractABI = [
        "function castVote(string memory ballotId, string memory candidateId, string memory voterToken) public returns (bool)"
    ];
    
    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);
    
    // Vote parameters
    const ballotId = "ballot1";
    const candidateId = "candidate1";
    const voterToken = "voter1";
    
    try {
        // Cast the vote
        const tx = await contract.castVote(ballotId, candidateId, voterToken);
        console.log('Transaction sent:', tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        console.log('Vote cast successfully!');
    } catch (error) {
        console.error('Error casting vote:', error.message);
    }
}

castVote(); 