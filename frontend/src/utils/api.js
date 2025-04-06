import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Try accessToken first (new format)
    let token = localStorage.getItem('accessToken');

    // Fall back to token (old format) if accessToken doesn't exist
    if (!token) {
      token = localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;

      // Debug token usage
      console.log('Using token in API request:', {
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 15) + '...',
        endpoint: config.url
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Try to refresh the token
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token'); // Also remove old token format

          // Attempt to get a new token
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          // If successful, save the new tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('token', accessToken); // Also store in old format
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry the original request with the new token
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token'); // Also remove old token format
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  verifyToken: () => api.post('/auth/verify-token'),
};

// Users API calls
export const usersAPI = {
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.patch(`/users/${id}`, data),
  generateVoterToken: (id) => api.post(`/users/${id}/voter-token`),
  verifyUser: (id) => api.patch(`/users/${id}/verify`),
};

// Wallet API calls
export const walletAPI = {
  getNonce: (userId) => api.get(`/wallet/nonce/${userId}`),
  verifyWallet: (userId, data) => api.post(`/wallet/verify/${userId}`, data),
  updateWalletAddress: (userId, address) => api.post(`/wallet/update/${userId}`, { walletAddress: address }),
  getWalletStatus: (userId) => api.get(`/wallet/status/${userId}`),
};

// Voting API calls
export const votingAPI = {
  getBallots: () => api.get('/voting/ballots'),
  getActiveBallots: () => api.get('/voting/ballots/active'),
  getBallot: (id) => api.get(`/voting/ballots/${id}`),
  createBallot: (data) => api.post('/voting/ballots', data),
  updateBallot: (id, data) => api.put(`/voting/ballots/${id}`, data),
  deleteBallot: (id) => api.delete(`/voting/ballots/${id}`),
  castVote: (data) => api.post('/voting/cast-vote', data),
  getUserVotes: () => api.get('/voting/my-votes'),
  getBallotResults: (ballotId) => api.get(`/voting/results/${ballotId}`),
};

export default api; 