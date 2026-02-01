const express = require('express');
const axios = require('axios');
const vader = require('vader-sentiment');
const router = express.Router();

const NEWS_API_KEY = process.env.NEWS_API_KEY; 
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines'; 

// Helper function to classify VADER compound score
const classifySentiment = (score) => {
    if (score >= 0.05) return 'Positive';
    if (score <= -0.05) return 'Negative';
    return 'Neutral';
};

router.get('/headlines', async (req, res) => {
    const { category = 'general', sentiment } = req.query;

    if (!NEWS_API_KEY) {
        return res.status(500).json({ message: "API key is missing in server configuration." });
    }

    try {
        // 1. Fetch News Data from external API
        const apiResponse = await axios.get(NEWS_API_URL, {
            params: {
                country: 'us',
                category: category,
                apiKey: NEWS_API_KEY,
                pageSize: 25 // Fetch up to 25 articles
            }
        });

        // 2. Process and Analyze Sentiment
        const processedArticles = apiResponse.data.articles
            // Filter out articles with no title or "[Removed]" status
            .filter(article => article.title && article.title.toLowerCase() !== "[removed]") 
            .map(article => {
                const title = article.title;
                const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(title);
                const compoundScore = intensity.compound;
                const sentimentLabel = classifySentiment(compoundScore);

                return {
                    ...article,
                    sentiment: sentimentLabel,
                    compoundScore: compoundScore
                };
            })
            // 3. Filter by User Preference (if a sentiment filter is provided)
            .filter(article => !sentiment || article.sentiment === sentiment);

        res.json(processedArticles);

    } catch (error) {
        console.error("News API Error:", error.message);
        res.status(500).json({ message: "Failed to fetch and analyze news." });
    }
});

module.exports = router;