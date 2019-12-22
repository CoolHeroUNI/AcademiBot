const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const cuenta_Solicitante = require("../Cuentas/cuenta_Solicitante");

class Historial_Seleccion extends Model {  }

Historial_Seleccion.init({
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Solicitante,
      key: 'id'
    }
  },
  anterior_ruta_seleccionada: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nueva_ruta_seleccionada: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: false,
      fields: ['codigo_cuenta']
    }
  ],
  freezeTableName: true,
  timestamps: true,
  updatedAt: false,
  sequelize,
  comment: 'Historial de Seleccion, registra la anterior ruta y nueva ruta seleccionada.'
});
module.exports = Historial_Seleccion;