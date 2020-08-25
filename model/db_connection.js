var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'db-7.csf4fip4nnls.ap-northeast-2.rds.amazonaws.com',
  user     : 'user',
  password : 'hanadatabase',
  database : 'health_db3'
});
 
//db.connect();
if(!db._connectCalled ) 
{
	console.log('dv coneccted');
	db.connect();
}

// connection.query('SELECT * FROM users_customuser', function (error, results, fields) {
//   if (error) throw error;
//   console.log(results);
// });
 
// connection.end();

module.exports = db;