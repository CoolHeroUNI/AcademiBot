const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class CanalMensajeria extends Model {  }

CanalMensajeria.init({
  nombre: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  freezeTableName: true,
  sequelize,
  comment: 'Entidad que contiene los atributos del Canal de Mensajeria.'
});
module.exports = CanalMensajeria;