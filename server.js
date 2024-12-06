const express = require('express');
const bodyParser = require('body-parser');
const registrationRoutes = require('./routes/registrationRoutes');
const loginRoutes = require('./routes/loginRoutes');
require('dotenv').config(); 

const app = express();
const port = process.env.SERVER_PORT;

app.use(bodyParser.json());

// Routes
app.use('/api', registrationRoutes);
app.use('/api', loginRoutes);

app.get('/', (req, res) => {
  res.send('Hello World! The database connection is successful.');
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
