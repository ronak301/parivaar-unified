const { sequelize } = require('../config/database');
const { addRelative } = require('../services/relationship');
const { insertUser } = require('../services/user');

const createRelative = async (req, res) => {
  const body = req.body;

  const transaction = await sequelize.transaction();

  try {
    const user = await insertUser(body, transaction);

    await addRelative(
      {
        userId: body.relative.id,
        relativeId: user.id,
        type: body.relative.type,
      },
      transaction
    );

    await transaction.commit();

    res.status(200).json({
      message: 'Relative created successfully',
    });
  } catch (error) {
    console.log(error);
    await transaction.rollback();
    res.status(500).json({
      message: 'Something went wrong',
      error: error,
    });
  }
};

module.exports = {
  createRelative,
};
