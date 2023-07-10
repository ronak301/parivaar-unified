const { checkRoles } = require('../services/executive');

const executiveAuth = async (req, res, next) => {
  const userId = req.body.userId;
  const communityId = req.body.communityId;

  try {
    const executive = await checkRoles({
      userId,
      communityId,
      rolesToCheck: ['OWNER', 'ADMIN'],
    });
    console.log(
      '🚀 ~ file: executiveAuth.js:13 ~ executiveAuth ~ executive:',
      executive
    );

    if (executive) {
      return next();
    } else {
      return res.status(401).send('Unauthorized');
    }
  } catch (error) {
    console.log(
      '🚀 ~ file: executiveAuth.js:20 ~ executiveAuth ~ error:',
      error
    );
    return res.status(500).send('Server Side Error Occured');
  }
};

module.exports = executiveAuth;
