import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";

export default class SistemaCalificacion extends Model {  }

SistemaCalificacion.init({
  codigo: {
    type: DataTypes.CHAR,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    }
  ],
  timestamps: false,
  freezeTableName: true,
  sequelize,
  comment: 'Esta entidad almacena atributos acerca el sistema de calificacion.'
});