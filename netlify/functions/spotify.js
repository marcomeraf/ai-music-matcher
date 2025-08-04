const fetch = require('node-fetch');

const SPOTIFY_CLIENT_ID = '6a5d13df3d304b8cb3413b54f1d151c9';
const SPOTIFY_CLIENT_SECRET = '7ec729a1b84244398b228f38077bbe71';

exports.handler = async (event, context) => {
  try {
    const { mood, activity, energy, time, genre } = event.queryStringParameters || {};
    
    // Get Spotify token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });
    
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;
    
    // Search logic here...
    
    return {
      statusCode: 200,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: true, token: 'working!' })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
