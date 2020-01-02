const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
    defaultValue: 0
  },
  longitud_promedio: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  ultimo_mensaje: {
    type: DataTypes.STRING(1023),
    defaultValue: ''
  },
  hora_promedio: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario-canal_mensajeria',
  timestamps: true,
  paranoid: true,
  underscored: true,
  sequelize,
  comment: "Cuenta del usuario en un canal de mensajeria definido, posee informacion publica de este en formato JSON y un identificador que puede o no ser único en el canal de mensajería."
});

UsuarioCanal_mensajeria.beforeUpdate(async (cuenta, options) => {
  const n = cuenta.total_mensajes_enviados - 1;
  cuenta.longitud_promedio = (( cuenta.longitud_promedio * n ) + cuenta.ultimo_mensaje.length )/( n + 1 );
  let hora_promedio = await sequelize.query("SELECT CALC_MEAN_TIME(?,?)", {
    replacements: [cuenta.hora_promedio.toLocaleString(), n],
    plain: true,
    transaction: options.transaction
  });
  hora_promedio = Object.values(hora_promedio)[0];
  cuenta.hora_promedio = hora_promedio;
});

module.exports = UsuarioCanal_mensajeria;