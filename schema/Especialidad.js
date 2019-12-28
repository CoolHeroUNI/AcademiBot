const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Facultad = require("./Facultad");

class Especialidad extends Model {  }

Especialidad.init({
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facultad_id: {
    type: DataTypes.STRING(10),
    references: {
      model: Facultad,
      key: 'id'
    },
    allowNull: false
  }
},{
  indexes: [
    {
      unique: true,
      fields: [{ name: 'nombre' }]
    }
  ],
  comment: 'Esta entidad almacena atributos de la Especialidad.',
  tableName: 'especialidad',
  timestamps: false,
  sequelize
});
module.exports = Especialidad;
