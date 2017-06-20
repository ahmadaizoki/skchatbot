'use strict';

var promise = require('bluebird');
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var db=pgp(process.env.DATABASE_URL);
module.exports=function getPersonne(req,res,next) {
  db.any('SELECT * FROM projet')
  .then(function (data){
    res.status(200)
     .json({
       status:'success',
       data:data,
       message:'Retrived all projet'
     });
  })
  .catch(function(err){
    return next(err);
  });
 console.log(res);
}
