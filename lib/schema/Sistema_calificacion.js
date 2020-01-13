const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");

class Sistema_calificacion extends Model {  }

Sistema_calificacion.init({
  id: {
    type: DataTypes.CHAR(1),
    allowNull: false,
    primaryKey: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'sistema_calificacion',
  sequelize,
  underscored: true,
  comment: 'Esta entidad describe un sistema de calificación, incluyendo el como se debe calcular el promedio en cada caso.'
});

module.exports = Sistema_calificacion;