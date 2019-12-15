import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/database";
import Curso from "../Entidades/Curso";
import SistemaCalificacion from "../Entidades/SistemaCalificacion";


export default class Curso_SC extends Model {  }

Curso_SC.init({
  id_curso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'id'
    },
    comment: 'Clave foranea de la relacion con Curso.'
  },
  id_sc: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SistemaCalificacion,
      key: 'id'
    },
    comment: 'Clave foranea de la relacion con Sistema de Calificacion.'
  }
}, {
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['id_curso', 'id_sc']
    }
  ],
  sequelize,
  comment: 'Relacion entre las entidades Curso y Sistema de Calificacion'
});