const { DataTypes, Model } = require ("sequelize");
const sequelize = require ("../../config/database");
const cuenta_Mensajeria = require("../Cuentas/cuenta_Mensajeria");
const Usuario_Canal = require("./Usuario_Canal");

class Usuario_CuentaMensajeria extends Model {  }

Usuario_CuentaMensajeria.init({
  codigo_perfil: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario_Canal,
      key: 'id'
    },
    allowNull: false
  },
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: cuenta_Mensajeria,
      key: 'id'
    },
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['codigo_perfil', 'codigo_cuenta']
    }
  ],
  freezeTableName: true,
  sequelize,
  timestamps: true,
  comment: 'Relacion entre la entidad Usuario y Cuenta de mensajeria.'
});
module.exports = Usuario_CuentaMensajeria;