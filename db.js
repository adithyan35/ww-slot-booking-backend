require('dotenv').config(); 

const mysql = require('mysql2');  

const db = mysql.createConnection({  
  host: process.env.DB_HOST,  
  user: process.env.DB_USER,  
  password: process.env.DB_PASSWORD,  
  database: process.env.DB_NAME,  
  port: process.env.DB_PORT || 3306,

});  

db.connect((err) => {  
  if (err) {  
    console.error('Error connecting to the database:');
    console.error('Host:', process.env.DB_HOST);
    console.error('User:', process.env.DB_USER);
    console.error('Database:', process.env.DB_NAME);
    console.error('Port:', process.env.DB_PORT);
    console.error('Error stack:', err.stack); 
    return;  
  }  
  console.log('Connected to the database as id ' + db.threadId);  
});

module.exports = db;  
