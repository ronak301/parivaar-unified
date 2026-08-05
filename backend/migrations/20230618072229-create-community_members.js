'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('community_members', {
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
    await queryInterface.addConstraint('community_members', {
      fields: ['user_id', 'community_id'],
      type: 'unique',
      name: 'unq_member',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      'community_members',
      'community_members_community_id_fkey'
    );
    await queryInterface.removeConstraint(
      'community_members',
      'community_members_user_id_fkey'
    );
    await queryInterface.removeConstraint('community_members', 'unq_member');
    await queryInterface.dropTable('community_members');
  },
};
