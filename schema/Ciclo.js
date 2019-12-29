const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Ciclo extends Model {  }

Ciclo.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'ciclo',
  timestamps: false,
  sequelize,
  underscored: true,
  comment: 'Esta entidad almacena atributos sobre el Ciclo academico.'
});

module.exports = Ciclo;