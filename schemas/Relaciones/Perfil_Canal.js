import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import PerfilMensajeria from "../Entidades/PerfilMensajeria";
import CanalMensajeria from "../Entidades/CanalMensajeria";

export default class Perfil_Canal extends Model {  }

Perfil_Canal.init({
  codigo_perfil: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PerfilMensajeria,
      key: 'id'
    }
  },
  codigo_canal: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: CanalMensajeria,
      key: 'id'
    }
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['codigo_perfil', 'codigo_canal']
    }
  ],
  sequelize,
  freezeTableName: true,
  timestamps: false,
  comment: 'Relacion entre las entidades Perfil y Canal de mensajeria'
});