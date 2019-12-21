const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const cuenta_Estudiante = require("../Cuentas/cuenta_Estudiante");

class Historial_Estudiante extends Model {  }

Historial_Estudiante.init({
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Estudiante,
      key: 'id'
    }
  },
  anterior_ciclo_relativo: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: true,
    defaultValue: null
  },
  nuevo_ciclo_relativo: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: true,
    defaultValue: null
  },
  anterior_especialidad: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  nueva_especialidad: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  freezeTableName: true,
  timestamps: true,
  updatedAt: false,
  sequelize,
  comment: 'Historial de los cambios realizados en la cuenta Estudiante por los eventos.'
});
module.exports = Historial_Estudiante;