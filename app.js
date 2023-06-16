const express = require('express');
const app = express();

require('./config/database.js');

// Routes
const userRoutes = require('./routes/user.js');
const businessRoutes = require('./routes/business.js');
const communityRoutes = require('./routes/community.js');
const relationshipRoutes = require('./routes/relationship.js');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', userRoutes);
app.use('/business', businessRoutes);
app.use('/community', communityRoutes);
app.use('/relationship', relationshipRoutes);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
