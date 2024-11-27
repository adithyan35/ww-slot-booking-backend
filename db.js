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
    console.log('Error connecting to the database:', err.stack);  
    return;  
  }  
  console.log('Connected to the database as id ' + db.threadId);  
});  

module.exports = db;  
