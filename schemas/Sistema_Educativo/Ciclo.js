import { Model, DataTypes } from 'sequelize';
import sequelize from '../../config/database';

class Ciclo extends Model {  }

Ciclo.init({
  numero: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false,
  sequelize,
  comment: 'Esta entidad almacena atributos sobre el Ciclo.'
});

export default Ciclo;