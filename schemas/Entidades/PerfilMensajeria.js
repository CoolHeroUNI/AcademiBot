import { DataTypes, Model } from "sequelize";

export default class PerfilMensajeria extends Model {  }

PerfilMensajeria.init({
  codigo_identificador: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false
  },
  informacion_publica: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  freezeTableName: true,
  indexes: [

  ]
});