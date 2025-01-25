const axios = require('axios');

async function keepAlive() {
  try {
    const response = await axios.get('https://status-boh2.onrender.com/keep-alive');
    console.log('Keep-alive successful:', response.data);
  } catch (error) {
    console.error('Keep-alive failed:', error);
  }
}

module.exports = keepAlive;

