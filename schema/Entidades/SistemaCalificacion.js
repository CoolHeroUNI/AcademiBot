const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class SistemaCalificacion extends Model {  }

SistemaCalificacion.init({
  codigo: {
    type: DataTypes.CHAR,
    allowNull: false
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
      fields: ['codigo']
    }
  ],
  timestamps: false,
  freezeTableName: true,
  sequelize,
  comment: 'Esta entidad almacena atributos acerca el sistema de calificacion.'
});
module.exports = SistemaCalificacion;