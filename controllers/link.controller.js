const express = require('express')
const db = require('../model/db_connection.js')
const bodyParser = require('body-parser')
const app = express()
const userController = require('./user.controller.js')
var Promise = require('promise');

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('link controller called');


var postLink = function(protectorID, wearerID){
	console.log(wearerID + " " + protectorID)
	var post = 'INSERT INTO users_linkeduser(protector_id, wearer_id) VALUES (?, ?)';
	return new Promise(function(resolve, reject){
		db.query(post, [protectorID, wearerID], function(error, results, fields){
			if(error) {
				return reject(error);
			}
			resolve();//only wearer can add the link
		})
	});
}

var getLinkUserID = function(username){
	return new Promise(function(resolve, reject){
		userController.findUserByID(username, function(error, results, fields) {
			if(error) throw error;
			if(results.length < 1){
				reject("none")
			}else{
				resolve([results[0].id, results[0].user_type]);
			}
		})
	});
}

var connectUsers = async function(req, res){
	var linkList = [req.body.protectorID, req.body.wearerID];
	var idList =[];
	//check if both id exist
	console.log(linkList);
	for(var i = 0; i < linkList.length; i++){

		try{
			var getID = await getLinkUserID(linkList[i]);
		}catch(err){
			res.status(500).send(err);
			return false;
		}
		if( (i == 0 && getID[1] != 'P') || (i == 1 && getID[1] != 'W') ){
			res.status(500).send("TYPE NOT MATCHED");
			return false;
		}
		idList.push(getID[0]);
		
	}

	console.log('idList', idList);
	//check both user user is alredy linked
	var checkLink = 'SELECT * FROM users_linkeduser WHERE protector_id = ? AND wearer_id = ? ';
	db.query(checkLink,idList, function(error, results, fields){
		if(error) throw error;
		if(results.length > 0){
			res.status(500).send('redundant');
		}else{
			postLink(idList[0], idList[1]).then(function(){
				userController.findUserByID(linkList[0], function(error, userInfo, fields) {
					if(error) throw error;
					userInfo[0].password = undefined
					res.status(200).json(userInfo);
				})
			})
			.catch(error => res.status(500).send(error));
		}
	})

}

 

 



module.exports = {
	connectUsers : connectUsers
};