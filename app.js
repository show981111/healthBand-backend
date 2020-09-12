const path = require('path');
const express = require('express');
// const app = express();
var app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

const bodyParser = require('body-parser');
const port = 8000;
const http = require('http');
// const socketio = require('socket.io');
var userRouter = require('./routes/user.routes.js');

const formatMessage = require('./model/messages.js');
const formatLocation = require('./model/location.js');

const {userJoin, getCurrentUser} = require('./utils/users.js');
// const server = http.createServer(app);
// const io = io.listen(server);

console.log("hello");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use('/user', userRouter);



// app.get('/', (req, res) => {
//   res.send('Hello World!!!!')
// }) 
io.on('connection', socket => {

	console.log("NEW WS CONNECT");
	//console.log(socket);

	socket.on('login', (username) => {
		console.log("new connection from Android", username);
	});

	// socket.on('androidMessage', (msg) => {
	// 	console.log(msg);
	// 	//io.to(user.room).emit('message', formatMessage(user.username,msg));
	// });

	socket.emit('welcome', formatMessage('CHATBOT', 'USER has joined on chat'));//everyone except self


	socket.on('joinLink', (data) => {
		//const linkInfo = data.split(","); 
		const linkInfo = data;
		console.log('join Link', linkInfo);
		if(linkInfo.user_type == 'W'){
			console.log(linkInfo.username, " joined ",linkInfo.username );
			if(io.sockets.adapter.rooms[linkInfo.username]){
				console.log("already joined");
			}else{
				socket.join(linkInfo.username);//착용자라면 자기 아이디의 룸에 접속
			}
		}else{
			for(var i = 0 ; i < linkInfo.linkedList.length; i++){//보호자라면, 각각 착용자의 룸에 접속 
				console.log(linkInfo.username, " joined ",linkInfo.linkedList[i].username );
				socket.join(linkInfo.linkedList[i].username);
			}
			
		}

		// socket.on('sendData', (msg) => {
		// 	console.log(msg);
		// 	io.to(linkInfo[1]).emit('message', formatMessage(user.username,msg));
		// });
		socket.on('androidMessage', (msg) => {
			console.log("send Message ! ")
			console.log(msg);
			console.log(linkInfo.username);
			// io.to(linkInfo.username).emit('sendData', formatMessage(linkInfo[1],msg.content));
			socket.broadcast.to(linkInfo.username).emit('sendData', formatMessage(linkInfo[1],msg.content));
			//socket.broadcast.to(linkInfo.username).emit('sendLocation', formatMessage(linkInfo[1],msg.content));

		});

		socket.on('sendLocation', (msg) => {
			console.log("send Location ! ");
			// io.to(linkInfo.username).emit('sendData', formatMessage(linkInfo[1],msg.content));
			socket.broadcast.to(linkInfo.username).emit('sendLocation', formatLocation(linkInfo[1],msg.content, msg.lat, msg.lang));

		});
	})

	// socket.on('androidMessage', (msg) => {
	// 	console.log(msg);
	// 	socket.broadcast.emit('sendData', formatMessage("send Data From ",msg));
	// });

	socket.on('joinRoom', ({username, room}) => {
		const user = userJoin(socket.id, username, room);
		console.log(user);
		socket.join(user.room);


		socket.emit('message', formatMessage('CHATBOT','WELCOME TO CHAT'));//to everyone
	
		//BroadCast When User Joined
		socket.broadcast.to(user.room).emit('message', formatMessage('CHATBOT', user.username +' has joined on chat'));//everyone except self

		socket.on('chatMessage', (msg) => {
			console.log(msg);
			io.to(user.room).emit('message', formatMessage(user.username,msg));
		});

		socket.on('disconnect', () => {
			io.emit('message', formatMessage('CHATBOT', user.username +' has left the chat'));
		});
	
	})
	
	
	//Runs When Client DIsconnect
	
 
});


server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
