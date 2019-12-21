const { DataTypes, Model } = require ("sequelize");
const sequelize = require ("../../config/database");
const Usuario = require("../Entidades/Usuario");
const cuenta_Donador = require("../Cuentas/cuenta_Donador");

class Usuario_CuentaDonador extends Model {  }

Usuario_CuentaDonador.init({
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
      model: cuenta_Donador,
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
  comment: 'Relacion entre el Usuario y la cuenta de donador.'
});
module.exports = Usuario_CuentaDonador;