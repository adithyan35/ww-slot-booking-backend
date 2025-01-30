const express = require('express');
const bodyParser = require('body-parser');
const registrationRoutes = require('./routes/registrationRoutes');
const loginRoutes = require('./routes/loginRoutes');
const turfRoutes = require('./routes/turfRoutes');
const courtRoutes = require("./routes/courtRoutes");
const slotRoutes = require("./routes/slotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const session = require('express-session');
require('dotenv').config(); 

const app = express();
const port = process.env.SERVER_PORT;

app.use(bodyParser.json());

require('events').EventEmitter.defaultMaxListeners = 20;

// Configure and use sessions
app.use(
  session({
      secret: 'your_secret_key', // Replace with a secure secret key
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge: 60000 }, // Optional: Set cookie expiration time
  })
);

// Example route to test session
app.get('/test-session', (req, res) => {
  if (!req.session.views) {
      req.session.views = 1;
  } else {
      req.session.views++;
  }
  res.send(`You have visited this page ${req.session.views} times`);
});

// Routes
app.use('/wox', registrationRoutes);
app.use('/wox', loginRoutes);
app.use("/wox", courtRoutes);
app.use("/wox", slotRoutes);
app.use("/wox", bookingRoutes);
app.use('/wox', turfRoutes);


app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => {
  res.send('Hello World! The database connection is successful.');
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
