const Sequelize = require('sequelize');
const { createClient } = require('@supabase/supabase-js');

// Create a new Supabase client
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// Create a new Sequelize instance
// const sequelize = new Sequelize({
//   dialect: 'postgres',
//   host: process.env.SUPABASE_URL,
//   port: 5432,
//   username: process.env.SUPABASE_SERVICE_ROLE_KEY,
//   password: process.env.SUPABASE_SERVICE_ROLE_PASSWORD,
//   database: process.env.SUPABASE_DATABASE,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
// });

//create a new sequelize instance with localhost postgres

const sequelize = new Sequelize('postgres', 'postgres', 'sbQGwkg39QWFJ64k', {
  host: 'db.vmkshebyuvhvgyiwqeqv.supabase.co',
  dialect: 'postgres',
  logging: false,
});

// const sequelize = new Sequelize('postgres', 'postgres', '12345678', {
//   host: 'localhost',
//   dialect: 'postgres',
//   logging: false,
// });

// Test the database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // await sequelize.sync({ alter: true });
    // console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

module.exports = { sequelize };
