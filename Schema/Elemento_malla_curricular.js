const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Elemento_malla_curricular extends Model {  }

Elemento_malla_curricular.init({
  especialidad_id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  curso_id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  ciclo_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true
  }
}, {
  tableName: 'elemento_malla_curricular',
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

module.exports = Elemento_malla_curricular;