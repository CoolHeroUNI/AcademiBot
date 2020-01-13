const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Usuario extends Model {  }

Usuario.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  initialAutoIncrement: 1000000000,
  timestamps: true,
  updatedAt: false,
  underscored: true,
  paranoid: true,
  tableName: 'usuario',
  sequelize,
  comment: "El usuario es el personaje central del negocio, posee diversas cuentas que se actualizan a través de eventos."
});

module.exports = Usuario;