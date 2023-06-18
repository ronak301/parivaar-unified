const Relationship = require('../models/Relationship');

exports.addRelative = async (data, transaction) => {
  const { userId, relativeId, type } = data;
  console.log(data);

  try {
    await Relationship.create(
      {
        user_id: userId,
        relative_id: relativeId,
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
