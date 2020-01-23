const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Usuario_donacion extends Model {  }

Usuario_donacion.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    unique: true,
    allowNull: false
  },
  total: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  hora_promedio: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario-donacion',
  timestamps: true,
  createdAt: false,
  underscored: true,
  sequelize,
  hasTrigger: true,
  comment: "Cuenta de donaciones, lleva registro de los recursos que ha donado el usuario."
});

module.exports = Usuario_donacion;