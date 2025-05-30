const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files
app.use(express.static('public'));

// Route for the home page
app.get('/', async (req, res) => {
    try {
        // First, get the teams
        const teamsResponse = await axios.get('https://api.balldontlie.io/v1/teams', {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            }
        });

        // Then get the games
        const gamesResponse = await axios.get('https://api.balldontlie.io/v1/games', {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            },
            params: {
                'seasons[]': 2023,
                'per_page': 10
            }
        });

        const matches = gamesResponse.data.data.map(match => {
            const homeTeam = teamsResponse.data.data.find(team => team.id === match.home_team.id);
            const awayTeam = teamsResponse.data.data.find(team => team.id === match.visitor_team.id);
            
            return {
                homeTeam: homeTeam ? homeTeam.full_name : 'Unknown Team',
                awayTeam: awayTeam ? awayTeam.full_name : 'Unknown Team',
                date: new Date(match.date).toLocaleString(),
                venue: match.arena || 'TBD',
                status: match.status
            };
        });

        // Pass both matches and error (as null) to the template
        res.render('index', { matches, error: null });
    } catch (error) {
        console.error('Error fetching matches:', error);
        // Pass empty matches array and error message
        res.render('index', { matches: [], error: 'Failed to fetch matches' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 