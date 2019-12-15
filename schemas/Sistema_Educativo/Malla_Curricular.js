import { Model, DataTypes } from 'sequelize';
import Especialidad from "./Especialidad";
import Ciclo from "./Ciclo";
import Curso from "./Curso";
import sequelize from "../../config/database";

export default class Malla_Curricular extends Model {  }

Malla_Curricular.init({
  id_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Especialidad,
      key: 'id'
    },
    comment: 'Clave foranea que relaciona con la Especialidad.'
  },
  id_ciclo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ciclo,
      key: 'id'
    },
    comment: 'Clave foranea que relaciona con el Ciclo.'
  },
  id_curso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'id'
    },
    comment: 'Clave foranea que relaciona con el Curso.'
  }
}, {
  timestamps: true,
  updatedAt: false,
  freezeTableName: true,
  sequelize,
  comment: 'Relacion entre las entidades Especialidad, Ciclo y Curso.'
});
