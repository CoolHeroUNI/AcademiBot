const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Especialidad = require("../Entidades/Especialidad");
const Ciclo = require("../Entidades/Ciclo");
const Curso = require("../Entidades/Curso");

class Malla_Curricular extends Model {  }

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
  indexes: [
    {
      unique: true,
      fields: ['id_ciclo', 'id_especialidad', 'id_curso']
    }
  ],
  comment: 'Relacion entre las entidades Especialidad, Ciclo y Curso.'
});
module.exports = Malla_Curricular;