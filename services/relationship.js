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
    throw { message: 'Error while creating relationship' };
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
    console.log(err);
    throw { message: 'Error while creating relationship' };
  }
};
