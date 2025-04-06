// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VotingSystem
 * @dev Smart contract for a blockchain-based voting system
 */
contract VotingSystem {
    // Contract owner
    address public owner;
    
    // Voter token mapping for verification
    mapping(string => bool) public registeredVoterTokens;
    
    // Mapping to track whether a voter token has already voted in a specific ballot
    mapping(string => mapping(string => bool)) public hasVoted; // ballotId => voterToken => hasVoted
    
    // Mapping of encrypted votes by ballot ID
    mapping(string => bytes32[]) public encryptedVotes;
    
    // Mapping of candidate votes by ballot ID and candidate ID
    mapping(string => mapping(string => uint256)) public candidateVotes;
    
    // Event emitted when a vote is cast
    event VoteCast(string ballotId, bytes32 encryptedVote);
    
    // Event emitted when a voter token is registered
    event VoterTokenRegistered(string voterToken);
    
    // Modifier to restrict access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner to the deployer
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a voter token to allow voting
     * @param voterToken The unique token assigned to a voter
     */
    function registerVoterToken(string memory voterToken) public onlyOwner {
        registeredVoterTokens[voterToken] = true;
        emit VoterTokenRegistered(voterToken);
    }
    
    /**
     * @dev Register multiple voter tokens in batch
     * @param voterTokens Array of voter tokens to register
     */
    function batchRegisterVoterTokens(string[] memory voterTokens) public onlyOwner {
        for (uint i = 0; i < voterTokens.length; i++) {
            registeredVoterTokens[voterTokens[i]] = true;
            emit VoterTokenRegistered(voterTokens[i]);
        }
    }
    
    /**
     * @dev Cast a vote in a ballot
     * @param ballotId The ID of the ballot being voted in
     * @param candidateId The ID of the candidate receiving the vote
     * @param voterToken The token of the voter casting the vote
     * @return success Whether the vote was successfully cast
     */
    function castVote(
        string memory ballotId,
        string memory candidateId,
        string memory voterToken
    ) public returns (bool success) {
        // Verify the voter token is registered
        require(registeredVoterTokens[voterToken], "Voter token is not registered");
        
        // Verify the voter hasn't already voted in this ballot
        require(!hasVoted[ballotId][voterToken], "Voter has already cast a vote in this ballot");
        
        // Mark the voter as having voted in this ballot
        hasVoted[ballotId][voterToken] = true;
        
        // Create encrypted vote representation
        bytes32 encryptedVote = keccak256(abi.encodePacked(ballotId, candidateId, voterToken, block.timestamp));
        
        // Store the encrypted vote
        encryptedVotes[ballotId].push(encryptedVote);
        
        // Increment candidate vote count
        candidateVotes[ballotId][candidateId]++;
        
        // Emit vote cast event
        emit VoteCast(ballotId, encryptedVote);
        
        return true;
    }
    
    /**
     * @dev Get the number of votes for a candidate in a ballot
     * @param ballotId The ID of the ballot
     * @param candidateId The ID of the candidate
     * @return count The number of votes for the candidate
     */
    function getCandidateVoteCount(
        string memory ballotId,
        string memory candidateId
    ) public view returns (uint256 count) {
        return candidateVotes[ballotId][candidateId];
    }
    
    /**
     * @dev Get the total number of votes cast in a ballot
     * @param ballotId The ID of the ballot
     * @return count The total number of votes in the ballot
     */
    function getTotalVoteCount(string memory ballotId) public view returns (uint256 count) {
        return encryptedVotes[ballotId].length;
    }
    
    /**
     * @dev Check if a voter has already voted in a specific ballot
     * @param ballotId The ID of the ballot
     * @param voterToken The token of the voter
     * @return voted Whether the voter has already voted
     */
    function checkIfVoted(
        string memory ballotId,
        string memory voterToken
    ) public view returns (bool voted) {
        return hasVoted[ballotId][voterToken];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be the zero address");
        owner = newOwner;
    }
} 