import { Model, DataTypes } from "sequelize";
import Especialidad from "./Especialidad";
import Facultad from "./Facultad";
import sequelize from "../../config/database";

class Facultad_Especialidad extends Model {  }

Facultad_Especialidad.init({
  id_facultad: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Facultad,
      key: 'id'
    },
    comment: 'Clave foranea que pertenece a la entidad Facultad.'
  },
  id_especialidad: {
    type: DataTypes.STRING,
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

export default Facultad_Especialidad;