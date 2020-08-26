const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const crypto = require('crypto');
const moment = require('moment');
var Promise = require('promise');


require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('controller called');

var checkLoginInput =  function(req,res,next){
	console.log(req.params);
	var data;
	if (req.method == "POST") {
       data = req.body;
    }else if (req.method == "GET") {
       data = req.params;
    }
	const user = new User(data);
	user.validateUserInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var checkRegisterInput = function(req,res,next){
	console.log("get middleware");
	const user = new User(req.body);
	user.validateRegisterInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var findUserByID = function(userID, callback){
	console.log("find user called");
	var sql = 'SELECT id, username, name, user_type, phone_number, password FROM users_customuser WHERE username = ? ';
	//var sql = 'SELECT * FROM users_customuser';
	db.query(sql ,[userID] , callback);
	//res.status(200).json(userInfo);
}

 
var getLinkedUser = function(userID,userType){
	var sql = 'SELECT C.username , C.name, C.user_type, C.phone_number FROM users_customuser A ' +
				'LEFT JOIN users_linkeduser B ON A.id = IF(A.user_type = "P", B.protector_id, B.wearer_id ) ' +
			    'LEFT JOIN users_customuser C ON C.id = IF(A.user_type = "W", B.protector_id, B.wearer_id ) ' +
			    'WHERE A.username = ?';

	return new Promise(function(resolve, reject){
		db.query(sql, [userID], function (error, results, fields) {
		  if (error){
		  	return reject(error);
		  };
		  console.log(results);
		  resolve(results);
		});
	});
}


var getUserInfoByID = function(req, res){

	console.log(req.params.userID);
	//var uesrPassword = req.userPassword;
	//var sql = 'SELECT * FROM users_customuser';
	var response;
	findUserByID(req.params.userID, function (error, results, fields) {
		if (error) throw error;
		if(results.length > 0){
			response = results;
			response[0].password = undefined;
			console.log(response);
			getLinkedUser(req.params.userID, response[0].user_type).then(function(linkedUsers){
				response[0].linkedUserList = linkedUsers;
				console.log('linked', linkedUsers);
				res.status(200).json(response);
			});
		}else{
			res.status(404).send("not found");
		}
	});
	//res.status(200).json(userInfo);
	
}
 

let registerUser = function(req, res){

	console.log(req.body);
	var date = moment().format('YYYY-MM-DD HH:mm:ss');
	console.log(date);
	var hashedPW = crypto.createHash('sha256').update(req.body.userPassword).digest('base64');
	console.log(hashedPW);
	var sql = 'INSERT INTO users_customuser(password, is_active, date_joined, username, name, user_type, phone_number)'+
				' VALUES (?,?,?,?,?,?,?)  ';
	var params = [hashedPW, 1, date, req.body.userID, req.body.name, req.body.user_type, req.body.phone_number];

	findUserByID(req.body.userID, function (error, results, fields) {
	  if (error) throw error;
	  if(results.length > 0){
	  	res.status(500).send('redundant');
	  }else{
	  	db.query(sql , params ,function (error, results, fields) {
		  if (error) throw error;
		  res.status(200).send('success');
		});
	  }
	})

}

let loginUser = function(req, res){
	
	console.log("login controller called");
	var response;
	//var sql = 'SELECT * FROM users_customuser';
	var hashedPW = crypto.createHash('sha256').update(req.body.userPassword).digest('base64');
	findUserByID(req.body.userID, function (error, results, fields) {
	  if (error) throw error;
	  if(results.length > 0){
	  	if(results[0].password != hashedPW && false){
	  		res.status(403).send("password incorrect");
	  	}else{
	  		response = results;
	  		response[0].password = undefined;
	  		getLinkedUser(req.body.userID, results[0].user_type).then(function(linkedUsers){
	  			response[0].linkedUserList = linkedUsers;
	  			console.log('linked', linkedUsers);
	  			res.status(200).json(response);
	  		});

	  	}
	  }else{
	  	res.status(404).send("not found");
	  }
	})
}


module.exports = {
	findUserByID : findUserByID,
	checkLoginInput : checkLoginInput,
	checkRegisterInput : checkRegisterInput,
	getUserInfoByID : getUserInfoByID,
	registerUser : registerUser,
	loginUser : loginUser,
};