const express = require('express')
const bodyParser = require('body-parser')
var router = express.Router()


router.use(bodyParser.urlencoded({extended:false}))
router.use(bodyParser.json())




router.get('/', (req, res) => {//특정유저 얻기 
  res.send('Hello World! USER')
})


router.get('/:userId', getUserInfoController)//특정 유저에 대한 정보 얻기...


router.post('/register', registerUserController)

// (req, res) => {//회원가입 
//   console.log(req.body); 
//   res.send('hello post')
// }

router.post('/login', loginUserController)

// (req, res) => {//로그인(포스트 사용!)
// 	console.log(req.params.userId);
//   res.send('Hello World! USER' + req.params.userId)
// }

module.exports = router;