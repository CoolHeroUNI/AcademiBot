import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

export default class Curso extends Model {  };

Curso.init({
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  creditos: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: true,
    defaultValue: null
  }
}, {
  freezeTableName: true,
  timestamps: true,
  createdAt: false,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: ['codigo']
    }
  ],
  comment: 'Esta entidad almacena atributos sobre el Curso.'
});
