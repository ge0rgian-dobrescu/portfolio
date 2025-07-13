// server.js
const express = require('express');
const fetch = require('node-fetch'); 

const app = express();
const PORT = 8080; 

app.use(cors());

app.use(express.json());

app.use(express.static('.'));

app.post('/check-url', async (req, res) => {
    const targetUrl = req.body.targetUrl; 

    if (!targetUrl) {
        return res.status(400).json({ status: 'invalid', message: 'No URL provided.' });
    }

    try {
        const response = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });

        console.log(`Backend received status ${response.status} for URL: ${targetUrl}`);

        // Check the HTTP status code and send appropriate response back to the frontend
        if (response.ok) { // Status is 2xx (Success)
            res.json({ status: 'valid', message: 'URL is valid.' });
        } else if (response.status >= 300 && response.status < 400) {
            // Status is 3xx (Redirection)
            res.json({ status: 'invalid', message: `Invalid URL: Redirection detected (Status: ${response.status}).` });
        } else if (response.status >= 400 && response.status < 500) {
            // Status is 4xx (Client Error, e.g., 404 Not Found, 403 Forbidden)
            res.json({ status: 'invalid', message: `Invalid URL: Client error (Status: ${response.status}).` });
        } else if (response.status >= 500 && response.status < 600) {
            // Status is 5xx (Server Error)
            res.json({ status: 'invalid', message: `Invalid URL: Server error (Status: ${response.status}).` });
        } else {
            // Any other unexpected status code
            res.json({ status: 'invalid', message: `Invalid URL: Unexpected status (Status: ${response.status}).` });
        }

    } catch (error) {
        console.error("Server-side fetch error for URL:", targetUrl, error);
        res.status(500).json({ status: 'invalid', message: 'Invalid URL: Could not reach the specified address (network issue).' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT} to use the QR Code Generator.`);
});
