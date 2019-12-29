const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Tipo_cuenta = require("./Tipo_cuenta");

class Cuenta extends Model {  }

Cuenta.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
  },
  tipo_cuenta_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    references: {
      model: Tipo_cuenta,
      key: 'id'
    },
    allowNull: false
  }
}, {
  sequelize,
  tableName: 'cuenta',
  initialAutoIncrement: 1000000000,
  timestamps: true,
  updatedAt: false,
  createdAt: false,
  paranoid: true,
  underscored: true,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'tipo_cuenta_id' }]
    }
  ],
  comment: "Instancia de cuenta, entidad volátil que permite representar el comportamiento de los personajes."
});

module.exports = Cuenta;