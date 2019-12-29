const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");
const Sistema_calificacion = require("./Sistema_calificacion");

class Curso extends Model {  }

Curso.init({
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  creditos: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  sistema_calificacion_id: {
    type: DataTypes.CHAR(1),
    allowNull: false
  }
}, {
  tableName: 'curso',
  timestamps: true,
  createdAt: false,
  sequelize,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'sistema_calificacion_id' }]
    }
  ],
  comment: 'Esta entidad almacena atributos sobre el Curso.'
});
Curso.belongsTo(Sistema_calificacion, { foreignKey: 'sistema_calificacion_id', as: 'sc' });

module.exports = Curso;