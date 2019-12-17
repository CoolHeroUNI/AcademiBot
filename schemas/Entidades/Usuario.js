import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";

export default class Usuario extends Model {  }

Usuario.init({
  acepta_publicidad: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  updatedAt: false,
  sequelize,
  comment: 'Entidad usuario, solo contiene una Fecha de Creacion.'
});