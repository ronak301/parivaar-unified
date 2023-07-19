'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('executives', {
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
      roles: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
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

    await queryInterface.addConstraint('executives', {
      fields: ['community_id', 'user_id'],
      type: 'unique',
      name: 'unq_executive',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'executives',
      'executives_community_id_fkey'
    );
    await queryInterface.removeConstraint(
      'executives',
      'executives_user_id_fkey'
    );
    await queryInterface.dropTable('executives');
  },
};
