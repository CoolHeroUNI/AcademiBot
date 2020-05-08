const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class UsuarioCanal_mensajeria extends Model {  }

UsuarioCanal_mensajeria.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: false
  },
  canal_mensajeria_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  codigo: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  informacion_publica: {
    type: DataTypes.JSON,
    defaultValue: null,
    allowNull: true
  },
  total_mensajes_enviados: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  hora_promedio: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  valido: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'usuario-canal_mensajeria',
  timestamps: true,
  paranoid: true,
  underscored: true,
  sequelize,
  indexes: [
    {
      name: 'u-c_m',
      unique: true,
      fields: [{ name: 'canal_mensajeria_id' }, { name: 'codigo' }]
    }
  ],
  hasTrigger: true,
  comment: "Cuenta del usuario en un canal de mensajeria definido, posee informacion publica de este en formato JSON y un identificador que puede o no ser único en el canal de mensajería."
});

module.exports = UsuarioCanal_mensajeria;