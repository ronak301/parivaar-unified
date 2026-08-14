const { Applicant } = require('../models');

exports.createApplicant = async (payload) => {
  try {
    await Applicant.create(payload);
  } catch (error) {
    console.log('🚀 ~ exports.createApplicant= ~ error:', error);
    throw error;
  }
};
