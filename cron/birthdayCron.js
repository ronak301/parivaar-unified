const cron = require('node-cron');

const myFunction = () => {
  console.log('Running your function at 12 AM IST every day.');
  // Replace with your actual logic
};

const startBDayCron = () => {
  cron.schedule(
    '*/5 * * * * *',
    () => {
      myFunction();
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );
};

module.exports = {
  start: startBDayCron,
};
