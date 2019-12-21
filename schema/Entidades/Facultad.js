const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Facultad extends Model {  }

Facultad.init({
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
}, {
  comment: 'Esta entidad almacena atributos de la Facultad.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});
module.exports = Facultad;
