const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario_info = require("./Usuario_info");
const Usuario_donacion = require("./Usuario_donacion");
const Usuario_solicitud = require("./Usuario_solicitud");
const UsuarioCanal_mensajeria = require("./Usuario-Canal_mensajeria");

class Usuario extends Model {  }

Usuario.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
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

Usuario.hasOne(Usuario_info, { foreignKey: 'usuario_id', as: 'info' });
Usuario.hasOne(Usuario_donacion, { foreignKey: 'usuario_id', as: 'donacion' });
Usuario.hasOne(Usuario_solicitud, { foreignKey: 'usuario_id', as: 'solicitud' });
Usuario.hasMany(UsuarioCanal_mensajeria, {foreignKey: 'usuario_id', as: 'canal' });

module.exports = Usuario;