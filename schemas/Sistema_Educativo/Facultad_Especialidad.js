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
  comment: 'This is the relationship between Faculty and Speciality, readonly mostly.',
  sequelize
});

export default Facultad_Especialidad;