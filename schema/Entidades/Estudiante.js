const { DataTypes, Model, Op } = require("sequelize");
const sequelize = require("../../config/database");

class Estudiante extends Model {  }

Estudiante.init({
  codigo_universitario: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  ciclo_ingreso: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  freezeTableName: true,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: ['codigo_universitario'],
      where: {
        codigo_universitario: {
          [Op.ne]: null
        }
      }
    }
  ],
  comment: 'Entidad con los atributos de Estudiante.'
});
module.exports = Estudiante;