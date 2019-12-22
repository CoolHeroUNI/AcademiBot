const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Curso = require("../Entidades/Curso");
const SistemaCalificacion = require("../Entidades/SistemaCalificacion");

class Curso_SC extends Model {  }

Curso_SC.init({
  codigo_curso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'id'
    },
    comment: 'Clave foranea de la relacion con Curso.'
  },
  codigo_sc: {
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
      fields: ['codigo_curso', 'codigo_sc']
    }
  ],
  sequelize,
  comment: 'Relacion entre las entidades Curso y Sistema de Calificacion'
});

module.exports = Curso_SC;