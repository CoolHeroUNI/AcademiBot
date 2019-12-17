import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';

export default class Ciclo extends Model {  }

Ciclo.init({
  numero: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: ['numero']
    }
  ],
  comment: 'Esta entidad almacena atributos sobre el Ciclo academico.'
});

