'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('applicants', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      community_id: {
        type: Sequelize.BIGINT,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'communities',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        foreignKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      approval_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 'FALSE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add the unique constraint after creating the table
    await queryInterface.addConstraint('applicants', {
      fields: ['user_id', 'community_id'],
      type: 'unique',
      name: 'unq_member',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'applicants',
      'applicants_community_id_fkey'
    );
    await queryInterface.removeConstraint(
      'applicants',
      'applicants_user_id_fkey'
    );
    await queryInterface.removeConstraint('applicants', 'unq_member');
    await queryInterface.dropTable('applicants');
  },
};
