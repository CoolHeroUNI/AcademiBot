import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class cuenta_Donador extends Model {  }

cuenta_Donador.init({
  total_recursos_donados: {
    type: DataTypes.INTEGER({ unsigned: true }),
    allowNull: false,
    defaultValue: 0
  },
  hora_promedio_donaciones: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  freezeTableName: true,
  sequelize,
  comment: 'Cuenta de donaciones.'
});