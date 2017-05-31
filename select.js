'use strict';
const config = require('./config');
const pg = require('pg');
var promise = require('bluebird');

pg.defaults.ssl = true;
var options = {
    // Initialization Options
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);


module.exports = function(fonctionID){
    var fs = require('fs');
    let text="";
    db.any(`SELECT personne FROM projet WHERE fonction='${fonctionID}'`)
        .then(data => {
            text=data.toString();
            fs.readFile('./file1.json', 'utf-8', function(err, data1) {
                if (err) throw err

                var arrayOfObjects = JSON.parse(data1)
                arrayOfObjects.reponse.push(text)

                console.log(arrayOfObjects)

                fs.writeFile('./file1.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Done!')
                    var js=require('./file1.json');
                    console.log(js);
                })
            })
            //console.log(data);
        })
        .catch(error =>{
            console.log('ERROR:', error);
        });
}