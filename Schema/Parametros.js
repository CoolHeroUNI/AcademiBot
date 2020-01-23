const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Parametros extends Model {  }

Parametros.init({
  key: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  value: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'parametros',
  sequelize,
  timestamps: false,
  underscored: true,
  comment: 'Tabla para relacionar parametros en la base de datos que sean de obtencion necesaria para el funcionamiento correcto del modelo.'
});

module.exports = Parametros;