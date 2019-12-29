const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Especialidad = require("./Especialidad");
const Curso = require("./Curso");
const Ciclo = require("./Ciclo");

class Malla_curricular extends Model {  }

Malla_curricular.init({
  especialidad_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    references: {
      model: Especialidad,
      key: 'id'
    }
  },
  curso_id: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    references: {
      model: Curso,
      key: 'id'
    }
  },
  ciclo_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true,
    references: {
      model: Ciclo,
      key: 'id'
    }
  }
}, {
  tableName: 'malla_curricular',
  timestamps: true,
  createdAt: false,
  underscored: true,
  sequelize,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'especialidad_id' }, { name: 'ciclo_id' }]
    }
  ],
  comment: "Elemento de la malla curricular, denotado por tres claves foraneas que la vez se comportan como primaria."
});

module.exports = Malla_curricular;