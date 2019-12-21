const { DataTypes, Model } = require ("sequelize");
const sequelize = require ("../../config/database");
const Usuario = require("../Entidades/Usuario");
const cuenta_Solicitante = require("../Cuentas/cuenta_Solicitante");

class Usuario_CuentaSolicitante extends Model {  }

Usuario_CuentaSolicitante.init({
  codigo_usuario: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: cuenta_Solicitante,
      key: 'id'
    }
  }
}, {
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['codigo_usuario', 'codigo_cuenta']
    }
  ],
  sequelize,
  comment: 'Relacion entre el Usuario y la cuenta de solicitante.'
});
module.exports = Usuario_CuentaSolicitante;