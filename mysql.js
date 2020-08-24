var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'db-7.csf4fip4nnls.ap-northeast-2.rds.amazonaws.com',
  user     : 'user',
  password : 'hanadatabase',
  database : 'health_db3'
});
 
connection.connect();
 
connection.query('SELECT * FROM users_customuser', function (error, results, fields) {
  if (error) throw error;
  console.log(results);
});
 
connection.end();