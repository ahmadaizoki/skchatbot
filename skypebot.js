'use strict';

const apiai = require('apiai');  //pour se connecter avec l'api.ai
const config=require('./config');  //l'access au fichier de configuration
const uuid = require('node-uuid');  //framework pour générer  RFC4122 UUIDS
const botbuilder = require('botbuilder');  //framework pour développer les bots
var promise = require('bluebird');  //framework pour utiliser les promises
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);  //pour se connecter a la base de données
var pgp1=require('pg-promise')(options);  //pour se connecter a la base de données
var db=pgp(process.env.DATABASE_URL);  //se connecter a la base de données
var db1=pgp1(process.env.DATABASE_URL);  //se connecter a la base de données

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

    //Gerer le message recevoir de skype
    processMessage(session) {

        let messageText = session.message.text;
        let sender = session.message.address.conversation.id;
        let name=session.message.user.name;
        let username=name.toLowerCase();
        let roletest="";
        console.log(session.message.user.name);
        console.log(session.message);

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

            //Gerer la reponse
            apiaiRequest.on('response', (response) => {
                if (this._botConfig.devConfig) {
                    console.log(sender, "Recevoir api.ai reponse");
                }
                db1.any(`SELECT name,role FROM role WHERE name='${username}'`)
                    .then(data1=>{
                        let role;
                        try{
                            role=data1[0].role;
                        }catch (e) {
                            role="";
                        }
                        if (SkypeBot.isDefined(response.result) && SkypeBot.isDefined(response.result.fulfillment)) {
                            let responseText = response.result.fulfillment.speech;
                            let responseMessages = response.result.fulfillment.messages;
                            let intentName=response.result.metadata.intentName;
                            let responses;
                            let text="";

                            //Traiter la reponse pour chaque intent dans l'api.ai
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
                                fonction=fonction.toLowerCase();
                                projet=projet.toLowerCase();
                                db.any(`SELECT personne FROM projet WHERE projet='${projet}' AND fonction='${fonction}'`)
                                    .then(data => {
                                        console.log(data);
                                        for (var i in data){
                                            text=text+data[i].personne+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
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
                                projet=projet.toLowerCase();
                                db.any(`SELECT personne,fonction FROM projet WHERE projet='${projet}'`)
                                    .then(data => {
                                        for (var i in data){
                                            text=text+"La personne: "+data[i].personne+" et ca fonction: "+data[i].fonction+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
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
                                personne=personne.toLowerCase();
                                db.any(`SELECT projet,fonction FROM projet WHERE personne='${personne}'`)
                                    .then(data => {
                                        for (var i in data){
                                            text=text+"Le projet: "+data[i].projet+" et ca fonction: "+data[i].fonction+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
                                        } else {
                                            this.doRichContentResponse(session,text);
                                        }
                                    })
                                    .catch(error =>{
                                        console.log('ERROR:', error);
                                    });
                            } else if (intentName==="list" && role) {
                                let table=response.result.parameters.table1;
                                table=table.toLowerCase();
                                db.any(config.selectAll)
                                    .then(data => {
                                        for (var i in data){
                                            text=text+"Le projet: "+data[i].projet+" et la fonction: "+data[i].fonction+" et le prenom nom: "+data[i].personne+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
                                        } else {
                                            this.doRichContentResponse(session,text);
                                        }
                                    })
                                    .catch(error =>{
                                        console.log('ERROR:', error);
                                    });
                            } else if(intentName==="list" && !role){
                                this.doRichContentResponse(session,config.messageAccess);
                            } else if (intentName==="signifie"){
                                let syno=response.result.parameters.syno1;
                                syno=syno.toLowerCase();
                                db.any(`SELECT def FROM synonyme WHERE synonyme='${syno}'`)
                                    .then(data => {
                                        for (var i in data){
                                            text=text+data[i].def+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
                                        } else {
                                            this.doRichContentResponse(session,text);
                                        }
                                    })
                                    .catch(error =>{
                                        console.log('ERROR:', error);
                                    });
                            } else if (intentName==="date"){
                                let jalon;
                                let projet;
                                let jalon1 = response.result.parameters.d1;
                                let jalon2 = response.result.parameters.d2;
                                let jalon3 = response.result.parameters.d3;
                                let projet1 = response.result.parameters.na1;
                                let projet2 = response.result.parameters.na2;
                                let projet3 = response.result.parameters.na3;
                                if (jalon2 === "" && jalon3 === "") {
                                    jalon = jalon1;
                                } else if (jalon3 === "") {
                                    jalon = jalon1 + " " + jalon2;
                                } else {
                                    jalon = jalon1 + " " + jalon2 + " " + jalon3;
                                }
                                if (projet2 === "" && projet3 === "") {
                                    projet = projet1;
                                } else if (projet3 === "") {
                                    projet = projet1 + " " + projet2;
                                } else {
                                    projet = projet1 + " " + projet2 + " " + projet3;
                                }
                                jalon=jalon.toLowerCase();
                                projet=projet.toLowerCase();
                                db.any(`SELECT date FROM date WHERE nomprojet='${projet}' AND jalon='${jalon}'`)
                                    .then(data => {
                                        for (var i in data){
                                            text=text+data[i].date+" ";
                                        }
                                        if (text===""){
                                            this.doRichContentResponse(session,config.messageError);
                                        } else {
                                            this.doRichContentResponse(session,text);
                                        }

                                    })
                                    .catch(error =>{
                                        console.log('ERROR:', error);
                                    });
                            } else if (intentName==="insert"){
                                let projet;
                                let fonction;
                                let personne;
                                let projet1=response.result.parameters.projet1;
                                let projet2=response.result.parameters.projet2;
                                let projet3=response.result.parameters.projet3;
                                let fonction1 = response.result.parameters.fonction1;
                                let fonction2 = response.result.parameters.fonction2;
                                let fonction3 = response.result.parameters.fonction3;
                                let prenom=response.result.parameters.prenom1;
                                let nom=response.result.parameters.nom1;
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
                                personne=prenom+" "+nom;
                                personne=personne.toLowerCase();
                                fonction=fonction.toLowerCase();
                                projet=projet.toLowerCase();
                                if (personne==="" || fonction==="" || projet===""){
                                    this.doRichContentResponse(session,config.messageError);
                                } else {
                                    db.any(`INSERT INTO projet (projet,fonction,personne) VALUES ('${projet}','${fonction}','${personne}')`)
                                        .then(data=>{
                                            this.doRichContentResponse(session,responseText);
                                        })
                                        .catch(error =>{
                                            console.log('ERROR:', error);
                                        });
                                }



                            } else if (intentName==='fuck'){
                              let url ="./GIF/pardon.gif";
                                this.doRichContentResponse(session,url)
                            } else if (SkypeBot.isDefined(responseText)) {
                                this.doRichContentResponse(session,responseText);
                            } else {
                                console.log(sender, 'Recevoir message vide');
                            }
                        } else {
                            console.log(sender, 'Recevoir resulta vide');
                        }

                    })
                    .catch(error =>{
                        console.log('ERROR1:', error);
                    });


            });

            apiaiRequest.on('error', (error) => {
                console.error(sender, 'Error quand essayer de connecter avec api.ai', error);
            });

            apiaiRequest.end();
        } else {
            console.log('Message vide');
        }
    }

    //Envoyer la reponse vers skype
    doRichContentResponse(session, messages) {
        session.send(messages);
    }

    //Si l'action est définie ou pas définie
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
