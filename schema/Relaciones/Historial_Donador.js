const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const cuenta_Donador = require("../Cuentas/cuenta_Donador");

class Historial_Donador extends Model {  }

Historial_Donador.init({
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Donador,
      key: 'id'
    }
  },
  ruta_recurso_donado: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['ruta_recurso_donado']
    },
    {
      unique: false,
      fields: ['codigo_cuenta']
    }
  ],
  sequelize,
  freezeTableName: true,
  comment: 'Relacion de Historial para la cuenta de donador y el evento de donacion.'
});
module.exports = Historial_Donador;