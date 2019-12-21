const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class cuenta_Solicitante extends Model {  }

cuenta_Solicitante.init({
  ruta_seleccionada: {
    type: DataTypes.STRING,
    unique: false,
    allowNull: false,
    defaultValue: ''
  },
  total_envios_exitosos: {
    type: DataTypes.INTEGER({ unsigned: true }),
    unique: false,
    allowNull: false,
    defaultValue: 0
  },
  total_envios_fallidos: {
    type: DataTypes.INTEGER({ unsigned: true }),
    unique: false,
    allowNull: false,
    defaultValue: 0
  },
  hora_promedio_envios: {
    type: DataTypes.TIME,
    unique: false,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  sequelize,
  freezeTableName: true,
  comment: 'Cuenta de Solicitudes de recursos'
});
module.exports = cuenta_Solicitante;