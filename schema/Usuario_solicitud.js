const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cuenta = require("./Cuenta");

class Usuario_solicitud extends Model {  }

Usuario_solicitud.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    references: {
      model: Cuenta,
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    unique: true
  },
  total_exitosas: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  total_fallidas: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
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
  tableName: 'usuario-solicitud',
  timestamps: true,
  createdAt: false,
  underscored: true,
  sequelize,
  comment: "Cuenta de solicitudes, lleva registro de cuantas solicitudes realizó cada usuario y si fueron exitosas."
});

module.exports = Usuario_solicitud;