const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

class Facultad extends Model {  }

Facultad.init({
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    },
    {
      unique: true,
      fields: ['codigo']
    }
  ],
  comment: 'This entity stores attributes from the Faculty, it is mostly for read only.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});
module.exports = Facultad;