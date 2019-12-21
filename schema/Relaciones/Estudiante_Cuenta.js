const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const cuenta_Estudiante = require("../Cuentas/cuenta_Estudiante");
const Estudiante = require("../Entidades/Estudiante");

class Estudiante_Cuenta extends Model {  }

Estudiante_Cuenta.init({
  codigo_estudiante: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Estudiante,
      key: 'id'
    }
  },
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Estudiante,
      key: 'id'
    }
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['codigo_cuenta']
    },
    {
      unique: true,
      fields: ['codigo_estudiante']
    }
  ],
  sequelize,
  comment: 'Relacion entre la entidad Estudiante y su Cuenta.'
});
module.exports = Estudiante_Cuenta;