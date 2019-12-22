const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Especialidad = require("../Entidades/Especialidad");
const Ciclo = require("../Entidades/Ciclo");
const Curso = require("../Entidades/Curso");

class Malla_Curricular extends Model {  }

Malla_Curricular.init({
  codigo_especialidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Especialidad,
      key: 'id'
    },
    comment: 'Clave foranea que relaciona con la Especialidad.'
  },
  codigo_ciclo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Ciclo,
      key: 'id'
    },
    comment: 'Clave foranea que relaciona con el Ciclo.'
  },
  codigo_curso: {
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
      fields: ['codigo_ciclo', 'codigo_especialidad', 'codigo_curso']
    },
    {
      unique: false,
      fields: ['codigo_ciclo', 'codigo_especialidad']
    }
  ],
  comment: 'Relacion entre las entidades Especialidad, Ciclo y Curso.'
});
module.exports = Malla_Curricular;