Node.js Project Setup with MySQL Workbench and Postman

This guide provides comprehensive instructions to set up a Node.js project with MySQL Workbench and test the API endpoints using Postman. Follow each step to ensure successful integration.

Table of Contents

Install Node.js
Install MySQL Server
Install MySQL Workbench
Install Postman
Setting Up the MySQL Database
Setting Up the Node.js Project
Creating and Testing APIs with Postman
Troubleshooting

Prerequisites Ensure you have the following before starting:

Operating System: Windows, macOS, or Linux. Administrator Access: Required for installing software. Postman Installed: For API testing.


1. Install Node.js

Download the Node.js installer from the official website. Recommended Version: LTS (Long-Term Support). Run the installer: Follow the instructions and select the option to add Node.js to the system PATH. Verify installation: bash Copy code node -v npm -v
2. Install MySQL Server

Download MySQL Community Server from the MySQL website. During installation: Choose Server Only setup. Set a root password (make sure to remember this). Note the port (default: 3306). Start MySQL Server: Windows: Use MySQL Installer or Services. macOS/Linux: Start using: bash Copy code sudo service mysql start
3. Install MySQL Workbench

Download MySQL Workbench from the MySQL Workbench website. Install and open MySQL Workbench. https://www.javatpoint.com/mysql-workbench fellow this steps and complete the installation

Set up a connection:

Click the + button to create a new connection. Fill in the details: Hostname: localhost Port: 3306 Username: root Password: Your root password. Click Test Connection to verify.

4. Install Postman

Download Postman from the Postman website. Install and launch Postman. Create a free account or log in if required. Familiarize yourself with the interface for sending HTTP requests.

5. Setting Up the MySQL Database

Open MySQL Workbench and connect to the server. Create a new database: sql Copy code CREATE DATABASE ww-slotbooking;

Create a sample table for testing: sql Copy code

USE ww-slotbooking;

CREATE TABLE registration ( id int NOT NULL AUTO_INCREMENT, username varchar(50) NOT NULL, mobilenum varchar(45) NOT NULL, email varchar(100) NOT NULL, password varchar(200) NOT NULL, otp_code varchar(10) DEFAULT NULL, otp_verify binary(10) NOT NULL DEFAULT 'FALSE\0\0\0\0\0', created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), UNIQUE KEY username_UNIQUE (username), UNIQUE KEY mobilenum_UNIQUE (mobilenum), UNIQUE KEY email_UNIQUE (email) ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com'), ('Bob', 'bob@example.com'); Note the database name (my_database) and the table (users).
6. Setting Up the Node.js Project

Create a new directory:

bash Copy code

mkdir ww-slot-booking-backend cd ww-slot-booking-backend

Initialize a Node.js project:

bash Copy code npm init -y Install dependencies:

bash Copy code npm install mysql2 express dotenv cros body-parser bcrypt crypto dotenv ejs jsonwebtoken nodemailer nodemon
7. Creating and Testing APIs with Postman

Start the server:

bash Copy code node server.js

Open Postman:

Create a new request. Set the method to GET. Enter the URL: http://localhost:3000/users. Click Send.

If everything is configured correctly, you’ll receive a JSON response like this: json Copy code [ { "id":1, "username":"asdd", "mobilenum":"123456789", "email":"asdd@gmail.com", "password":"123456", "confirmpassword":"123456", "otp_code":"1234", "otp_verify":{ "type":"Buffer", "data":[ 70, 65, 76, 83, 69, 0, 0, 0, 0, 0 ] }, "created_at":"2024-11-26T11:14:31.000Z" } ]
8. Troubleshooting

Common Issues and Fixes Node.js Not Found:

Ensure Node.js is installed and added to the PATH.

Database Connection Failed: Ensure the MySQL server is running.

No Response in Postman:

Check if the server is running (node server.js). Confirm the endpoint URL is correct.

Empty Response:

Ensure there is data in the users table using MySQL Workbench.