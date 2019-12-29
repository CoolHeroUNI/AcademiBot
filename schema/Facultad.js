const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Facultad extends Model {  }

Facultad.init({
  id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    primaryKey: true
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
  tableName: 'facultad',
  timestamps: false,
  sequelize
});
module.exports = Facultad;
