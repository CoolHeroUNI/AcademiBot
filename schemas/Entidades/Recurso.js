import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class Recurso extends Model {  }

Recurso.init({
  ruta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  extension: {
    type: DataTypes.STRING({ length: 10 }),
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['ruta']
    },
    {
      unique: false,
      fields: ['extension'],
      where: {
        extension: {
          $ne: null
        }
      }
    }
  ],
  sequelize,
  comment: 'Entidad Recurso, esta representa un archivo para distribuir.'
});