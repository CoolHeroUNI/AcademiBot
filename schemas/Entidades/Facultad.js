import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';

export default class Facultad extends Model {  }

Facultad.init({
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
}, {
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
  comment: 'Esta entidad almacena atributos de la Facultad.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});

