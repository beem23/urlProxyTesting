const express = require('express');
const app = express();
const cors = require('cors');
const request = require('request');
const multer = require('multer');
require('dotenv').config();
const rateLimit = require("express-rate-limit");

app.use(cors());
app.use(express.json());


app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later"
}));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.get('/', (req, res) => {
    const url = req.query.eURL;

    const options = {
        url: `https://www.virustotal.com/api/v3/urls/${url}`,
        headers: {
            accept: 'application/json',
            'x-apikey': process.env.API_KEY
        }
    };

    request(options, (error, response, body) => {
        if (error) {
            console.error(error);
            return res.status(500).send(error);
        }
        console.log('Hello this is the url sent:', url)
        res.json(JSON.parse(body));
    });
});

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    console.log(`Received file of size ${file.size} bytes`);
    const url = "https://www.virustotal.com/api/v3/files";
    const headers = {
        accept: "application/json",
        "x-apikey": process.env.API_KEY
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
            return res.status(500).send(error, "error in the files upload fetch");
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
                'x-apikey': process.env.API_KEY
            }
        };
        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                return res.status(500).send(error, "error in the file analysis report fetch");
            }
            // console.log('sha 256', JSON.parse(response.body).meta.file_info.sha256)

            getFileReport(JSON.parse(response.body).meta.file_info.sha256)
        });
    }
    function getFileReport(response) {
        const options = {
            url: `https://www.virustotal.com/api/v3/files/${response}`,
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-apikey': process.env.API_KEY
            }
        };
        request(options, (error, response, body) => {
            if (error) {
                console.error(error);
                return res.status(500).send(error, "error in the file report fetch");
            }
            console.log('Final API ran', JSON.parse(response.body))
            res.json(JSON.parse(response.body));
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Proxy server listening on port ${port}`);
});