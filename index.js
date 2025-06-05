const express = require('express');
const axios = require('axios');

let streamerData = [];

const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const USER_ID= process.env.USER_ID;

// Load environment variables from a .env file
require('dotenv').config();

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

// Endpoint to get a random row from the text file
app.get('/random-fact', (req, res) => {
  try {
    // Read the contents of the text file
    const filePath = path.join(__dirname, 'lore.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Split the file content into an array of rows
    const rows = fileContent.split('\n').filter(row => row.trim() !== '');

    // Get a random row
    const randomIndex = Math.floor(Math.random() * rows.length);
    const randomFact = rows[randomIndex];

    // Send the random row as JSON response
    res.json({ randomFact });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/twitch-streamers', async (req, res) => {
  try {
    const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
    const appAccessToken = tokenResponse.data.access_token;
    const streamResponse = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${USER_ID}`, {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${appAccessToken}`
        }
      });

    const streamTitle = streamResponse.data.data[0] ? streamResponse.data.data[0].title : 'Offline';
    streamerData = [];
    const streamerNames = (streamTitle.match(/@\w+/g) || []).map(name => name.substring(1)); 
    for (const name of streamerNames) {
        streamerData.push(name);
    }

    res.json(streamerNames);
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while trying to fetch data from Twitch API');
  }
});

app.get('/shotout', async (req, res) => { 
  res.json(streamerData.pop());
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});