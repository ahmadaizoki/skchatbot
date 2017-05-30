'use strict';

const apiai = require('apiai');
const uuid = require('node-uuid');
const botbuilder = require('botbuilder');
const pg=require('pg');
pg.defaults.ssl=true;

module.exports = class SkypeBot {

    get apiaiService() {
        return this._apiaiService;
    }

    set apiaiService(value) {
        this._apiaiService = value;
    }

    get botConfig() {
        return this._botConfig;
    }

    set botConfig(value) {
        this._botConfig = value;
    }

    get botService() {
        return this._botService;
    }

    set botService(value) {
        this._botService = value;
    }

    get sessionIds() {
        return this._sessionIds;
    }

    set sessionIds(value) {
        this._sessionIds = value;
    }

    constructor(botConfig) {
        this._botConfig = botConfig;
        var apiaiOptions = {
            language: botConfig.apiaiLang,
            requestSource: "skype"
        };

        this._apiaiService = apiai(botConfig.apiaiAccessToken, apiaiOptions);
        this._sessionIds = new Map();

        this.botService = new botbuilder.ChatConnector({
            appId: this.botConfig.skypeAppId,
            appPassword: this.botConfig.skypeAppSecret
        });

        this._bot = new botbuilder.UniversalBot(this.botService);

        this._bot.dialog('/', (session) => {
            if (session.message && session.message.text) {
                this.processMessage(session);
            }
        });

    }

    processMessage(session) {

        let messageText = session.message.text;
        let sender = session.message.address.conversation.id;

        if (messageText && sender) {

            console.log(sender, messageText);

            if (!this._sessionIds.has(sender)) {
                this._sessionIds.set(sender, uuid.v1());
            }

            let apiaiRequest = this._apiaiService.textRequest(messageText,
                {
                    sessionId: this._sessionIds.get(sender),
                    originalRequest: {
                        data: session.message,
                        source: "skype"
                    }
                });

            apiaiRequest.on('response', (response) => {
                if (this._botConfig.devConfig) {
                    console.log(sender, "Received api.ai response");
                }

                if (SkypeBot.isDefined(response.result) && SkypeBot.isDefined(response.result.fulfillment)) {
                    let responseText = response.result.fulfillment.speech;
                    let responseMessages = response.result.fulfillment.messages;
                    const exjson=require('./output');
                    let intentName=response.result.metadata.intentName;
                    let responses;
                    let text="";
                    let text1="";
                    function(callback,per){
                        const results = [];
                        // Get a Postgres client from the connection pool
                        pg.connect(process.env.DATABASE_URL, (err, client, done) => {
                            // Handle connection errors
                            if(err) {
                                done();
                                console.log(err);
                                return res.status(500).json({success: false, data: err});
                            }
                            // SQL Query > Select Data
                            const query = client.query('SELECT projet FROM projet;');
                        // Stream results back one row at a time
                        query.on('row', (row) => {
                            results.push(row);
                    });
                        // After all data is returned, close connection and return results
                        query.on('end', () => {
                            done();
                        console.log(results[0].projet);
                        text1=text+results[0].projet;
                    });
                    });
                        callback(apiaiRequest);
                        per=text1;
                        console.log(per);
                    }


                    if(intentName==="projet_fonction") {
                        let fonction;
                        let projet;
                        let fonction1 = response.result.parameters.fonction1;
                        let fonction2 = response.result.parameters.fonction2;
                        let fonction3 = response.result.parameters.fonction3;
                        let projet1 = response.result.parameters.projet1;
                        let projet2 = response.result.parameters.projet2;
                        let projet3 = response.result.parameters.projet3;
                        if (fonction2 === "" && fonction3 === "") {
                            fonction = fonction1;
                        } else if (fonction3 === "") {
                            fonction = fonction1 + " " + fonction2;
                        } else {
                            fonction = fonction1 + " " + fonction2 + " " + fonction3;
                        }
                        if (projet2 === "" && projet3 === "") {
                            projet = projet1;
                        } else if (projet3 === "") {
                            projet = projet1 + " " + projet2;
                        } else {
                            projet = projet1 + " " + projet2 + " " + projet3;
                        }
                        for (var i in exjson) {
                            if (exjson[i].projet === projet && exjson[i].fonction === fonction) {
                                text = text + exjson[i].personne + " ";
                            }
                        }
                        if (text === "") {
                            responses = "Vous pouvez préciser votre question?";
                        } else {
                            responses = text;
                        }
                    }else if(intentName==="projet"){
                        let projet;
                        let projet1=response.result.parameters.projet1;
                        let projet2=response.result.parameters.projet2;
                        let projet3=response.result.parameters.projet3;
                        if (projet2==="" && projet3===""){
                            projet=projet1;
                        }else if (projet3===""){
                            projet=projet1+" "+projet2;
                        }else {
                            projet=projet1+" "+projet2+" "+projet3;
                        }
                        for (var i in exjson){
                            if (exjson[i].projet===projet){
                                text=text+"[La personne:{ "+exjson[i].personne+"}, Sa fonction:{ "+exjson[i].fonction+"}] ";
                            }
                        }
                        if (text===""){
                            responses="Vous pouvez préciser votre question?";
                        }else {
                            responses=text;
                        }
                    }else if (intentName==="personne"){
                        let personne;
                        let prenom=response.result.parameters.prenom1;
                        let nom=response.result.parameters.nom1;
                        personne=prenom+" "+nom;
                        for (var i in exjson){
                            if (exjson[i].personne===personne){
                                text=text+"[Le projet:{ "+exjson[i].projet+"}, La fonction:{ "+exjson[i].fonction+"}] ";
                            }
                        }
                        if (text===""){
                            responses="Vous pouvez préciser votre question?";
                        }else {
                            responses=text;
                        }
                    }
                    else {
                        responses=responseText;
                    }

                    if (SkypeBot.isDefined(responseMessages) && responseMessages.length > 0) {
                        console.log(text1);
                        console.log("salut");
                        this.doRichContentResponse(session,responses);
                    } else if (SkypeBot.isDefined(responseText)) {
                        console.log(sender, 'Response as text message');
                        session.send(responseText);

                    } else {
                        console.log(sender, 'Received empty speech');
                    }
                } else {
                    console.log(sender, 'Received empty result');
                }
            });

            apiaiRequest.on('error', (error) => {
                console.error(sender, 'Error while call to api.ai', error);
            });

            apiaiRequest.end();
        } else {
            console.log('Empty message');
        }
    }

    doRichContentResponse(session, messages) {
        session.send(messages);
    }

    static isDefined(obj) {
        if (typeof obj == 'undefined') {
            return false;
        }

        if (!obj) {
            return false;
        }

        return obj != null;
    }
}