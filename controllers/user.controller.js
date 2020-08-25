const express = require('express')
const db = require('../model/db_connection.js')
const User = require('../model/user.model.js')
const bodyParser = require('body-parser')
const app = express()
const crypto = require('crypto');
const moment = require('moment');
require('moment-timezone'); 
moment.tz.setDefault("Asia/Seoul");

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

console.log('controller called');

var checkGetInput =  function(req,res,next){
	console.log("get middleware");
	const user = new User(req.params);
	user.validateUserInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var checkPostInput = function(req,res,next){
	console.log("get middleware");
	const user = new User(req.body);
	user.validateUserInput();
	if(user.errors.length > 0){
		res.status(500).send(user.errors[0]);
	}else{
		next();
	}
}

var findUserByID = function(userID, callback){
	console.log("find user called");
	var sql = 'SELECT * FROM users_customuser WHERE username = ? ';
	//var sql = 'SELECT * FROM users_customuser';
	db.query(sql ,[userID] , callback);
	//res.status(200).json(userInfo);
}
 


var getUserInfoByID = function(req, res){

	console.log(req.params.userID);
	//var uesrPassword = req.userPassword;
	var userInfo;
	//var sql = 'SELECT * FROM users_customuser';
	findUserByID(req.params.userID, function (error, results, fields) {
	  if (error) throw error;
	  userInfo = results;
	  console.log(results);
	  res.status(200).json(userInfo);
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

	//var sql = 'SELECT * FROM users_customuser';
	var hashedPW = crypto.createHash('sha256').update(req.body.userPassword).digest('base64');

	findUserByID(req.body.userID, function (error, results, fields) {
	  if (error) throw error;
	  if(results.length > 0){
	  	if(results[0].password != hashedPW ){
	  		res.status(403).send("password incorrect");
	  	}else{
	  		res.status(200).json(results);
	  	}
	  }else{
	  	res.status(404).send("not found");
	  }
	})
}


module.exports = {
	checkGetInput : checkGetInput,
	checkPostInput : checkPostInput,
	getUserInfoByID : getUserInfoByID,
	registerUser : registerUser,
	loginUser : loginUser
};