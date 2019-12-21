const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Ciclo extends Model {  }

Ciclo.init({
  numero: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: ['numero']
    }
  ],
  comment: 'Esta entidad almacena atributos sobre el Ciclo academico.'
});

module.exports = Ciclo;