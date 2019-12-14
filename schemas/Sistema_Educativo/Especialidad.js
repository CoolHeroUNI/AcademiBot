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
  comment: 'This entity stores attributes from the Speciality, it is mostly for read only.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});
