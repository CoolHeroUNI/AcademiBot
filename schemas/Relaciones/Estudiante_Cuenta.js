import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import cuenta_Estudiante from "../Cuentas/cuenta_Estudiante";
import Estudiante from "../Entidades/Estudiante";

export default class Estudiante_Cuenta extends Model {  }

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
      unique: unique,
      fields: ['codigo_estudiante']
    }
  ],
  sequelize,
  comment: 'Relacion entre la entidad Estudiante y su Cuenta.'
});