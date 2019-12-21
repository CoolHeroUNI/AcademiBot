const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class cuenta_Mensajeria extends Model {  }

cuenta_Mensajeria.init({
  total_mensajes_enviados: {
    type: DataTypes.INTEGER({ unsigned: true }),
    allowNull: false,
    defaultValue: 0
  },
  hora_promedio_mensajes_enviados: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  esta_habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  sequelize,
  freezeTableName: true,
  comment: 'Cuenta de mensajes del Usuario.'
});
module.exports = cuenta_Mensajeria;