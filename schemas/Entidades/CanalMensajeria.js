import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class CanalMensajeria extends Model {  }

CanalMensajeria.init({
  nombre: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  freezeTableName: true,
  sequelize,
  comment: 'Entidad que contiene los atributos del Canal de Mensajeria.'
});