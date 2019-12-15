import { Model, DataTypes } from "sequelize";
import Especialidad from "../Entidades/Especialidad";
import Facultad from "../Entidades/Facultad";
import sequelize from "../../config/database";

export default class Facultad_Especialidad extends Model {  }

Facultad_Especialidad.init({
  id_facultad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Facultad,
      key: 'id'
    },
    comment: 'Clave foranea que pertenece a la entidad Facultad.'
  },
  id_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Especialidad,
      key: 'id'
    },
    unique: true,
    comment: 'Clave foranea que pertenece a la entidad Especialidad.'
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_facultad', 'id_especialidad']
    }
  ],
  comment: 'Esta es la relacion de tipo agrupa entre las entidades Facultad y Especialidad.',
  sequelize
});

