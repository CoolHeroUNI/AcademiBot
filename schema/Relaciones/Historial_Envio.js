const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const cuenta_Solicitante = require("../Cuentas/cuenta_Solicitante");
const Recurso = require("../Entidades/Recurso");

class Historial_Envio extends Model {  }

Historial_Envio.init({
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Solicitante,
      key: 'id'
    }
  },
  recurso_solicitado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Recurso,
      key: 'id'
    }
  },
  envio_exitoso: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: false,
      fields: ['codigo_cuenta']
    },
    {
      unique: false,
      fields: ['recurso_solicitado']
    }
  ],
  freezeTableName: true,
  timestamps: true,
  updatedAt: false,
  sequelize,
  comment: 'Historial de envios, registra la cuenta responsable y el recurso solicitado.'
});
module.exports = Historial_Envio;