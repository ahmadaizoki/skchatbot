'use strict';

const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');

const SkypeBot = require('./skypebot');
const SkypeBotConfig = require('./skypebotconfig');
const config=require('./config');
const xlsxtojson = require('xlsx-to-json-lc');

const REST_PORT = (process.env.PORT || 5000);

xlsxtojson({
    input: config.fichier,
    output: "output.json",
    lowerCaseHeaders:true
}, function(err,result){
    if(err) {
        return res.json({data: null});
    }
});


const botConfig = new SkypeBotConfig(
    config.APIAI_ACCESS_TOKEN,
    config.APIAI_LANG,
    config.APP_ID,
    config.APP_SECRET
);

const skypeBot = new SkypeBot(botConfig);

// console timestamps
require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const app = express();
app.use(bodyParser.json());

app.post('/chat', skypeBot.botService.listen());

app.listen(REST_PORT, function () {
    console.log('Rest service ready on port ' + REST_PORT);
});