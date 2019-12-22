const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Especialidad = require("../Entidades/Especialidad");
const Facultad = require("../Entidades/Facultad");

class Facultad_Especialidad extends Model {  }

Facultad_Especialidad.init({
  codigo_facultad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Facultad,
      key: 'id'
    },
    comment: 'Clave foranea que pertenece a la entidad Facultad.'
  },
  codigo_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Especialidad,
      key: 'id'
    },
    comment: 'Clave foranea que pertenece a la entidad Especialidad.'
  }
}, {
  freezeTableName: true,
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['codigo_facultad', 'codigo_especialidad']
    }
  ],
  comment: 'Esta es la relacion de tipo agrupa entre las entidades Facultad y Especialidad.',
  sequelize
});

module.exports = Facultad_Especialidad;