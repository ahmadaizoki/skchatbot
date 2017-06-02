'use strict';

const apiai = require('apiai');
const config=require('./config');
const uuid = require('node-uuid');
const botbuilder = require('botbuilder');
var promise = require('bluebird');
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);

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
        let username=session.message.user.name;
        console.log(session.message.user.name);

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
                db.any(`SELECT name,role FROM role WHERE name='${username}'`)
                    .then(data=>{
                        console.log(data);
                    })
                    .catch(error =>{
                        console.log('ERROR:', error);
                    });

                if (SkypeBot.isDefined(response.result) && SkypeBot.isDefined(response.result.fulfillment)) {
                    let responseText = response.result.fulfillment.speech;
                    let responseMessages = response.result.fulfillment.messages;
                    let intentName=response.result.metadata.intentName;
                    let responses;
                    let text="";

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
                        db.any(`SELECT personne FROM projet WHERE projet='${projet}' AND fonction='${fonction}'`)
                            .then(data => {
                                for (var i in data){
                                    text=text+data[i].personne+" ";
                                }
                                if (text===""){
                                    this.doRichContentResponse(session,"je crois que tu t'es troumbé!");
                                } else {
                                    this.doRichContentResponse(session,text);
                                }

                            })
                            .catch(error =>{
                                console.log('ERROR:', error);
                            });
                    } else if(intentName==="projet"){
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
                        db.any(`SELECT personne,fonction FROM projet WHERE projet='${projet}'`)
                            .then(data => {
                                for (var i in data){
                                    text=text+"La personne: "+data[i].personne+" et ca fonction: "+data[i].fonction+" ";
                                }
                                if (text===""){
                                    this.doRichContentResponse(session,"je crois que tu t'es troumbé!");
                                } else {
                                    this.doRichContentResponse(session,text);
                                }
                            })
                            .catch(error =>{
                                console.log('ERROR:', error);
                            });
                    } else if (intentName==="personne"){
                        let personne;
                        let prenom=response.result.parameters.prenom1;
                        let nom=response.result.parameters.nom1;
                        personne=prenom+" "+nom;
                        db.any(`SELECT projet,fonction FROM projet WHERE personne='${personne}'`)
                            .then(data => {
                                for (var i in data){
                                    text=text+"Le projet: "+data[i].projet+" et ca fonction: "+data[i].fonction+" ";
                                }
                                if (text===""){
                                    this.doRichContentResponse(session,"je crois que tu t'es troumbé!");
                                } else {
                                    this.doRichContentResponse(session,text);
                                }
                            })
                            .catch(error =>{
                                console.log('ERROR:', error);
                            });
                    } else if (intentName==="list") {
                        let table=response.result.parameters.table1;
                        table=table.toLowerCase();
                        db.any(config.selectAll)
                            .then(data => {
                                for (var i in data){
                                    text=text+"Le projet: "+data[i].projet+" et la fonction: "+data[i].fonction+" et le prenom nom: "+data[i].personne+" ";
                                }
                                if (text===""){
                                    this.doRichContentResponse(session,"je crois que tu t'es troumbé!");
                                } else {
                                    this.doRichContentResponse(session,text);
                                }
                            })
                            .catch(error =>{
                                console.log('ERROR:', error);
                            });
                    } else if (SkypeBot.isDefined(responseText)) {
                        this.doRichContentResponse(session,responseText);
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