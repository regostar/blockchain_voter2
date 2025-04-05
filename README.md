# Blockchain Voting System

A secure, transparent, and decentralized voting system built on blockchain technology.

## Features

- **Secure Authentication**: JWT-based authentication with refresh tokens.
- **User Verification**: Admin approval and voter token generation for eligible voters.
- **Ballot Management**: Create, update, and manage voting ballots.
- **Blockchain Voting**: Cast votes securely on the Ethereum/Polygon blockchain.
- **Transparency**: All votes are recorded on the blockchain and can be independently verified.
- **Privacy**: Votes are encrypted to maintain voter privacy.

## Tech Stack

### Backend
- **Framework**: Node.js with NestJS
- **Database**: PostgreSQL for user data and application state
- **Authentication**: JWT/OAuth for session management
- **Blockchain Interaction**: ethers.js for Ethereum interaction

### Frontend
- **Framework**: React with React Router
- **Styling**: Bootstrap for responsive UI
- **State Management**: React Context API
- **Blockchain Interaction**: ethers.js for web3 integration

### Blockchain
- **Network**: Ethereum/Polygon (configurable)
- **Smart Contracts**: Solidity voting contract

### DevOps
- **Containerization**: Docker and Docker Compose
- **Local Blockchain**: Ganache for development

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Git

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd blockchain-voting-system
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost
   - API: http://localhost:3000/api
   - Swagger Documentation: http://localhost:3000/api/docs

### Local Development

1. Start the dependencies (PostgreSQL and Ganache):
   ```
   docker-compose up -d postgres ganache
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Start the backend in development mode:
   ```
   npm run start:dev
   ```

4. In another terminal, install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

5. Start the frontend in development mode:
   ```
   npm start
   ```

## Project Structure

```
blockchain-voting-system/
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── blockchain/     # Blockchain interactions
│   │   ├── voting/         # Voting logic
│   │   └── ...
│   └── ...
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── ...
│   └── ...
├── contracts/              # Solidity smart contracts
│   └── VotingSystem.sol    # Voting contract
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## API Documentation

The API documentation is available at `/api/docs` when the backend is running.

### Key Endpoints

- **Authentication**:
  - `POST /api/auth/login`: Log in with username and password
  - `POST /api/auth/verify-token`: Verify a JWT token

- **Users**:
  - `POST /api/users`: Register a new user
  - `POST /api/users/:id/voter-token`: Generate a voter token for a user

- **Voting**:
  - `GET /api/voting/ballots`: Get all ballots
  - `GET /api/voting/ballots/active`: Get active ballots
  - `POST /api/voting/cast-vote`: Cast a vote
  - `GET /api/voting/results/:ballotId`: Get ballot results

## Smart Contract

The `VotingSystem.sol` contract includes functionality for:

- Registering voter tokens
- Casting votes
- Counting votes
- Verifying vote status

## Security Considerations

- All votes are encrypted before being sent to the blockchain
- JWT tokens have short expiration times with refresh token capability
- User authentication is required for all sensitive operations
- Admin privileges are required for ballot management and user verification
- All blockchain transactions are signed with the user's private key

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 