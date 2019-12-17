import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class cuenta_Mensajeria extends Model {  }

cuenta_Mensajeria.init({
  total_mensajes_recibidos: {
    type: DataTypes.INTEGER({ unsigned: true }),
    allowNull: false,
    defaultValue: 0
  },
  hora_promedio_mensajes_recibidos: {
    type: DataTypes.TIME,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  esta_habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  sequelize,
  freezeTableName: true,
  comment: 'Cuenta de mensajes del Usuario.'
});