const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 8000;
var userRouter = require('./routes/user.routes.js');

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


app.use('/user', userRouter);



app.get('/', (req, res) => {
  res.send('Hello World!!!!')
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})