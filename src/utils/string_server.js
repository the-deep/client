const express = require('express');
const bodyparser = require('body-parser');
const fs = require('fs');

const app = express();

function runServer(port, filePath) {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use(bodyparser.json());
    app.use(bodyparser.urlencoded({ extended: true }));

    app.get('/', (request, response) => {
        response.send('Server is running. Use POST method to write string data to file');
    });

    app.post('/', (request, response) => {
        // write to file
        const date = (new Date()).toISOString();
        try {
            fs.writeFileSync(filePath, JSON.stringify(request.body, undefined, 4));
            response.send({
                message: 'Successful writing of string data',
            });
            console.log(`ACCESS: ${date} POST / -> 200`);
        } catch (e) {
            const resp = {
                error: 'Can\'t write to the file. Perhaps the directory does not exist or there is no permision to write.',
            };
            response.status(500).send(resp);
            console.log(`ACCESS: ${date} POST  / -> 500`);
        }
    });

    app.listen(port, (err) => {
        if (err) {
            console.error('ERROR: something bad happened', err);
        }
        console.log(`INFO: Server running on port ${port}`);
    });
}

function checkArgs() {
    // Check if location for saving json is passed via args or not
    const args = process.argv;
    if (args.length < 4) {
        console.error('ERROR: Please provide port number and file path.\n\tUSAGE: node <server.js> <port number> <file path>');
        process.exit(1);
    }
    return {
        port: args[2],
        filePath: args[3],
    };
}

function main() {
    const { port, filePath } = checkArgs();
    runServer(port, filePath);
}

main();
