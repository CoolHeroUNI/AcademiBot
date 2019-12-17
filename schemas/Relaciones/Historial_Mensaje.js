import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import cuenta_Mensajeria from "../Cuentas/cuenta_Mensajeria";

export default class Historial_Mensajes extends Model {  }

Historial_Mensajes.init({
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: cuenta_Mensajeria,
      key: 'id'
    }
  },
  contenido_mensaje: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: false,
      fields: ['codigo_cuenta']
    }
  ],
  sequelize,
  freezeTableName: true,
  comment: 'Historial de la cuenta de mensajeria del usuario.'
});