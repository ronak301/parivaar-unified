'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      full_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING,
      },
      profile_picture: {
        type: Sequelize.STRING,
      },
      image_path: {
        type: Sequelize.STRING,
      },
      guardian_name: {
        type: Sequelize.STRING,
      },
      dob: {
        type: Sequelize.DATEONLY,
      },
      bio: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.STRING,
      },
      education: {
        type: Sequelize.STRING,
      },
      native_place: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
        unique: true,
      },
      landline: {
        type: Sequelize.STRING,
      },
      wedding_date: {
        type: Sequelize.DATEONLY,
      },
      email: {
        type: Sequelize.STRING,
        validate: {
          isEmail: true,
        },
      },
      auth_id: {
        type: Sequelize.UUID,
        references: {
          model: {
            schema: 'auth', // Specify the schema name here
            tableName: 'users', // Specify the table name here
          },
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      blood_group: {
        type: Sequelize.STRING,
      },
      is_account_manager: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      last_seen: {
        type: Sequelize.DATEONLY,
      },
      is_super_admin: {
        type: Sequelize.BOOLEAN,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  },
};
