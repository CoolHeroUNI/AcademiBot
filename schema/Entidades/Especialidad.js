const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Especialidad extends Model {  }

Especialidad.init({
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
},{
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
  comment: 'Esta entidad almacena atributos de la Especialidad.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});
module.exports = Especialidad;
