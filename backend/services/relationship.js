const Relationship = require('../models/Relationship');

exports.addRelative = async (data, transaction) => {
  const { userId, relativeId, type } = data;
  console.log(data);

  try {
    await Relationship.create(
      {
        userId,
        relativeId,
        type,
      },
      {
        transaction,
      }
    );
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.addRelation = async ({ userId, relativeId, type }) => {
  try {
    await Relationship.create({
      userId,
      relativeId,
      type,
    });
    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: relationship.js:33 ~ exports.addRelation= ~ err:',
      err
    );
    throw err;
  }
};

exports.deleteRelation = async (id) => {
  try {
    await Relationship.destroy({
      where: {
        id,
      },
    });
    return true;
  } catch (err) {
    console.log(
      '🚀 ~ file: relationship.js:47 ~ exports.deleteRelation ~ err:',
      err
    );
    throw err;
  }
};
