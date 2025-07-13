// server.js
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 8080; // Or 3000, whichever port you're using. Make sure it matches what you open in browser.

app.use(express.json());
app.use(express.static('.'));

app.post('/check-url', async (req, res) => {
    const targetUrl = req.body.targetUrl;

    if (!targetUrl) {
        // Log the client's request if it's missing a URL
        console.warn('Frontend sent a request to /check-url without a targetUrl.');
        return res.status(400).json({ status: 'invalid', message: 'No URL provided.' });
    }

    // Log the URL being checked by the backend
    console.log(`Backend checking URL: ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, { method: 'HEAD', redirect: 'follow' });

        // Log the status code received by the backend from the target URL
        console.log(`Backend received status ${response.status} for URL: ${targetUrl}`);

        if (response.ok) { // Status is 2xx (Success)
            res.json({ status: 'valid', message: 'URL is valid.' });
        } else if (response.status >= 300 && response.status < 400) {
            res.json({ status: 'invalid', message: `Invalid URL: Redirection detected (Status: ${response.status}).` });
        } else if (response.status >= 400 && response.status < 500) {
            res.json({ status: 'invalid', message: `Invalid URL: Client error (Status: ${response.status}).` });
        } else if (response.status >= 500 && response.status < 600) {
            res.json({ status: 'invalid', message: `Invalid URL: Server error (Status: ${response.status}).` });
        } else {
            res.json({ status: 'invalid', message: `Invalid URL: Unexpected status (Status: ${response.status}).` });
        }

    } catch (error) {
        // *** ENHANCED ERROR LOGGING HERE ***
        console.error(`--- START Server-side fetch error for URL: ${targetUrl} ---`);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Code (if any):', error.code); // e.g., ETIMEDOUT, ENOTFOUND
        console.error('Error Stack:', error.stack);
        console.error('--- END Server-side fetch error ---');

        res.status(500).json({ status: 'invalid', message: 'Invalid URL: Could not reach the specified address (network issue).' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT} to use the QR Code Generator.`);
});
