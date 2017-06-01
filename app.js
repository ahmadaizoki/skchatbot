'use strict';

const apiai = require('apiai');
const express = require('express');
const bodyParser = require('body-parser');

const SkypeBot = require('./skypebot');
const SkypeBotConfig = require('./skypebotconfig');
const config=require('./config');
const pg =require('pg');


pg.defaults.ssl=true;

const REST_PORT = (process.env.PORT || 5000);

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