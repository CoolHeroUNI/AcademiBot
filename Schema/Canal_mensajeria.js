const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Canal_mensajeria extends Model {  }

Canal_mensajeria.init({
  id: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    comment: "Nombre del canal de mensajería."
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'canal_mensajeria',
  sequelize,
  timestamps: false,
  underscored: true,
  comment: "Entidad canal de mensajería, identificado por un nombre único, seguido de una descripción."
});
module.exports = Canal_mensajeria;