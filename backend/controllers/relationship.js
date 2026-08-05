const { sequelize } = require('../config/database');
const {
  addRelative,
  addRelation,
  deleteRelation,
} = require('../services/relationship');
const { insertUser } = require('../services/user');

const createRelativeController = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      message: 'Relative created successfully',
      id: user.id,
    });
  } catch (error) {
    console.log(
      '🚀 ~ file: relationship.js:34 ~ createRelativeController ~ error:',
      error
    );
    await transaction.rollback();
    return res.status(500).json({
      message: 'Something went wrong',
      error: error.errors[0].message ?? error.message,
    });
  }
};

const createRelationController = async (req, res) => {
  const body = req.body;

  try {
    await addRelation(body);

    return res.status(200).json({
      success: true,
      message: 'Relationship created successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Something went wrong',
      error: error.message,
    });
  }
};

const deleteRelationController = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteRelation(id);
    return res.status(200).json({
      success: true,
      message: 'Relationship deleted successfully',
    });
  } catch (err) {
    console.log(
      '🚀 ~ file: relationship.js:65 ~ deleteRelationController ~ err:',
      err
    );
    return res.status(500).json({
      message: 'Something went wrong',
      error: err,
    });
  }
};

module.exports = {
  createRelativeController,
  createRelationController,
  deleteRelationController,
};
