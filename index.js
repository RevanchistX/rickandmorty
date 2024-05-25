const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('ejs')


const app = express();
const port = 3000;
const API_URL = "https://rickandmortyapi.com/api";

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.get('/characters', async (req, res) => {
    try {
        const page = req.query.page || 1; // Get the page parameter from the query, default to page 1
        const response = await axios.get(`${API_URL}/character?page=${page}`);
        const characters = response.data.results;
        res.render('characters.ejs', {characters});
    } catch (error) {
        console.error('Error fetching characters:', error.message);
        res.status(500).send('Error fetching characters');
    }
});

app.get('/characters/:id', async (req, res) => {
    try {
        const characterId = req.params.id;
        const response = await axios.get(`${API_URL}/character/${characterId}`);
        const character = response.data; // Assuming the API returns the character directly
        res.render('characterDetails.ejs', {character});
    } catch (error) {
        console.error('Error fetching character details:', error.message);
        res.status(500).send('Error fetching character details');
    }
});

// Inside your Express server setup
app.get('/episodes', async (req, res) => {
    try {
        // Fetch the first page of episodes to determine the total number of pages
        const response = await axios.get(`${API_URL}/episode`);
        const totalPages = response.data.info.pages;

        // Fetch episodes from all pages concurrently
        const pageRequests = [];
        for (let page = 1; page <= totalPages; page++) {
            pageRequests.push(axios.get(`${API_URL}/episode?page=${page}`));
        }

        // Wait for all page requests to resolve
        const pageResponses = await Promise.all(pageRequests);

        // Extract episodes from each response
        const episodes = pageResponses.reduce((accumulator, response) => {
            return accumulator.concat(response.data.results);
        }, []);

        // Group episodes by season
        const seasons = {};
        episodes.forEach(episode => {
            const season = episode.episode.slice(1, 3);
            if (!seasons[season]) {
                seasons[season] = [];
            }
            seasons[season].push(episode);
        });

        res.render('episodes.ejs', {seasons});
    } catch (error) {
        console.error('Error fetching episodes:', error.message);
        res.status(500).send('Error fetching episodes');
    }
});


app.get('/locations', async (req, res) => {
    try {
        const response = await axios.get(API_URL + '/location');
        const locations = response.data.results;
        res.render('locations.ejs', {locations});
    } catch (error) {
        console.error('Error fetching locations:', error.message);
        res.status(500).send('Error fetching locations');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;