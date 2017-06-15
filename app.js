'use strict';

const apiai = require('apiai');  //pour se connecter avec l'api.ai
const express = require('express');  //framework pour développer les applications web
const bodyParser = require('body-parser');  //framework pour créer des middlewares pour parser les requests données
const SkypeBot = require('./skypebot');  //le code pour traiter la connextion et les messages entre l'api et skype
const SkypeBotConfig = require('./skypebotconfig');  //le code de verification
const config=require('./config');  //l'access au fichier de configuration

const REST_PORT = (process.env.PORT || 5000);

//Verifier les droits
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

// Connéxion au serveur
app.listen(REST_PORT, function () {
    console.log('La service sur la port ' + REST_PORT);
});
