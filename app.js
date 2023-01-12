const express = require('express');
const app = express();
const cors = require('cors');
const request = require('request');
const multer = require('multer');

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
    const url = req.query.eURL;

    const options = {
        url: `https://www.virustotal.com/api/v3/urls/${url}`,
        headers: {
            accept: 'application/json',
            'x-apikey': '82b15e23cacae9e3a10c94671ae01354316c38b18979f3aeeaef5b1d71b43ed1'
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }

        res.json(JSON.parse(body));
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    console.log(`Received file of size ${file.size} bytes`);
    const url = "https://www.virustotal.com/api/v3/files";
    const headers = {
        accept: "application/json",
        "x-apikey": '82b15e23cacae9e3a10c94671ae01354316c38b18979f3aeeaef5b1d71b43ed1'
    };
    const formData = {
        file: {
            value: file.buffer,
            options: {
                filename: file.originalname,
                contentType: file.mimetype
            }
        }
    }
    request.post({ url: url, formData: formData, headers: headers }, (error, response, body) => {
        if (error) {
            console.log(error);
        } else {
            const report = JSON.parse(body);
            // res.json(JSON.parse(body));
            getAnalysisReport(report);
            console.log('report from proxy', report);
        }
    });
    function getAnalysisReport(resData) {
        const options = {
            url: `https://www.virustotal.com/api/v3/analyses/${resData.data.id}`,
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-apikey': '82b15e23cacae9e3a10c94671ae01354316c38b18979f3aeeaef5b1d71b43ed1'
            }
        };
        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            console.log('sha 256', JSON.parse(response.body).meta.file_info.sha256)
            getFileReport(JSON.parse(response.body).meta.file_info.sha256)
        });
    }
    function getFileReport(response) {
        const options = {
            url: `https://www.virustotal.com/api/v3/files/${response}`,
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-apikey': '82b15e23cacae9e3a10c94671ae01354316c38b18979f3aeeaef5b1d71b43ed1'
            }
        };
        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                return res.status(500).send(error);
            }
            console.log('Final API ran', JSON.parse(response.body))
            res.json(JSON.parse(response.body));
        });
    }
});

// app.post('/upload', upload.single('file'), (req, res) => {
//     const file = req.file;
//     console.log(file.originalname)
//     const url = "https://www.virustotal.com/api/v3/files";
//     const formData = new FormData();
//     formData.append('file', file.buffer, file.originalname);
//     const headers = {
//         'Content-Type': 'multipart/form-data',
//         accept: "application/json",
//         "x-apikey": '82b15e23cacae9e3a10c94671ae01354316c38b18979f3aeeaef5b1d71b43ed1'
//     };
//     const options = {
//         method: 'POST',
//         headers: headers,
//         body: formData
//     };
//     request(url, options, (error, response, body) => {
//         if (error) {
//             console.log(error);
//         } else {
//             const report = JSON.parse(body);
//             console.log('report from proxy', report);
//         }
//     });
// });


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});

// app.all('/proxy', (req, res) => {
//     console.log('connected')
//     // get the target URL from the query parameter
//     const targetUrl = req.query.url;

//     // forward the incoming request to the target server
//     request(targetUrl, { method: req.method, json: req.body, headers: req.headers }, (error, response, body) => {
//         if (error) {
//             console.error(error);
//             res.status(500).send('Error occurred while forwarding the request');
//         } else {
//             // Add the necessary CORS headers to the response
//             res.set('Access-Control-Allow-Origin', '*');
//             res.set('Access-Control-Allow-Methods', 'GET, POST');
//             res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//             res.status(response.statusCode).json(body);
//         }
//     });
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Proxy server listening on port ${port}`);
// });

// const express = require('express');
// const request = require('request');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.all('/proxy', (req, res) => {
//     console.log('connected')
//     // get the target URL from the query parameter
//     const targetUrl = req.query.url;

//     // forward the incoming request to the target server
//     const proxy = request({
//         url: targetUrl,
//         method: req.method,
//         json: req.body,
//         headers: req.headers
//     });

//     // Add the necessary CORS headers to the response
//     res.set('Access-Control-Allow-Origin', '*');
//     res.set('Access-Control-Allow-Methods', 'GET, POST');
//     res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//     // pipe the response back to the client
//     proxy.pipe(res);
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log(`Proxy server listening on port ${port}`);
// });

// const express = require('express');
// const request = require('request');
// const cors = require('cors');
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.all('/proxy', cors(), (req, res) => {
//     // get the target URL from the query parameter
//     const targetUrl = req.query.url;

//     console.log(req.query);
//     console.log('req.query');
//     console.log(targetUrl);
//     console.log('targetUrl');
//     console.log(req.method);
//     console.log('req.method');
//     console.log(req.body);
//     console.log('req.body');
//     console.log(req.headers);
//     console.log('req.headers');

//     // forward the incoming request to the target server
//     const proxy = request({
//         url: targetUrl,
//         method: req.method,
//         json: req.body,
//         headers: req.headers
//     });

//     // add the necessary CORS headers to the response
//     // res.set('Access-Control-Allow-Origin', '*');
//     // res.set('Access-Control-Allow-Methods', 'GET, POST');
//     // res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//     // pipe the response back to the client
//     req.pipe(proxy).pipe(res);
// });

// const port = process.env.PORT || 3000;

// app.listen(port, () => {
//     console.log(`Proxy server listening on port ${port}`);
// });
