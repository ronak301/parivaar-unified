const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.DEV_JWT_SECRET, {}, async (err, user) => {
    if (err) return res.sendStatus(403);

    const userData = await User.findOne({
      where: {
        authId: user.sub,
      },
      attributes: ['id'],
    });

    if (!userData.id) {
      return res.sendStatus(401);
    }

    next();
  });
};
