const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.all('/proxy', (req, res) => {
    // get the target URL from the query parameter
    const targetUrl = req.query.url;

    // forward the incoming request to the target server
    const proxy = request({
        url: targetUrl,
        method: req.method,
        json: req.body,
        headers: req.headers
    });

    // add the necessary CORS headers to the response
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // pipe the response back to the client
    req.pipe(proxy).pipe(res);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});