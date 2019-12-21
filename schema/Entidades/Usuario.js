const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Usuario extends Model {  }

Usuario.init({
  acepta_publicidad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  sequelize,
  comment: 'Entidad usuario, solo contiene una Fecha de Creacion.'
});
module.exports = Usuario;