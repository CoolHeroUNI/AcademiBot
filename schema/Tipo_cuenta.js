const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Tipo_cuenta extends Model {  }

Tipo_cuenta.init({
  id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  underscored: true,
  sequelize,
  tableName: 'tipo_cuenta',
  comment: "Tipología de cuenta, permite el ordenamiento de todas las cuentas en categorías para una consulta más rápida y una relación más ordenada."
});

module.exports = Tipo_cuenta;