import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';
class Especialidad extends Model {  }

Especialidad.init({
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
},{
  indexes: [
    {
      unique: true,
      fields: ['nombre']
    },
    {
      unique: true,
      fields: ['codigo']
    }
  ],
  comment: 'Esta entidad almacena atributos de la Especialidad.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});

export default Especialidad;