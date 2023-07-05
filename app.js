const express = require('express');
const cors = require('cors');
const app = express();

require('./config/database.js');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: '*',
  })
);

// Routes
const userRoutes = require('./routes/user.js');
const businessRoutes = require('./routes/business.js');
const communityRoutes = require('./routes/community.js');
const relationshipRoutes = require('./routes/relationship.js');

// make a get route for / that returns a message
app.get('/', (req, res) => {
  res.send('Welcome to backend of Community App v1.0');
});

app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/community', communityRoutes);
app.use('/relationship', relationshipRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
