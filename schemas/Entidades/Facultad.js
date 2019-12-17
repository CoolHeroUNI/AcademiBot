import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

export default class Facultad extends Model {  }

Facultad.init({
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  }
}, {
  comment: 'Esta entidad almacena atributos de la Facultad.',
  freezeTableName: true,
  timestamps: false,
  sequelize
});

