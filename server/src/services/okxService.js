const axios = require('axios');
require('dotenv').config();

const OKX_BASE_URL = process.env.OKX_BASE_URL;
const OKX_API_KEY = process.env.OKX_API_KEY;

if (!OKX_API_KEY) {
  console.error('OKX_API_KEY is not set in environment variables');
}

const okxService = {
  async createAgentWallet(label) {
    try {
      const response = await axios.post(
        `${OKX_BASE_URL}/agent-wallets`,
        { label },
        {
          headers: {
            'Authorization': `Bearer ${OKX_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      return {
        success: true,
        data: {
          walletId: response.data.id,
          walletAddress: response.data.address,
          label: response.data.label,
          createdAt: response.data.created_at,
        },
      };
    } catch (error) {
      console.error('OKX API Error:', error.response?.data || error.message);
      
      // Provide more specific error messages based on OKX response
      let message = 'Failed to create wallet via OKX API';
      if (error.response) {
        message = `OKX API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        message = 'No response received from OKX API';
      }

      return {
        success: false,
        message,
      };
    }
  },
};

module.exports = okxService;