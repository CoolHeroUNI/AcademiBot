import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class Estudiante extends Model {  }

Estudiante.init({
  codigo_universitario: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  ciclo_ingreso: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  freezeTableName: true,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: ['codigo_universitario'],
      where: {
        codigo_universitario: {
          $ne: null
        }
      }
    }
  ],
  comment: 'Entidad con los atributos de Estudiante.'
});