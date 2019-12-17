import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import PerfilMensajeria from "../Entidades/PerfilMensajeria";
import cuenta_Mensajeria from "../Cuentas/cuenta_Mensajeria";

export default class Perfil_Cuenta extends Model {  }

Perfil_Cuenta.init({
  codigo_perfil: {
    type: DataTypes.INTEGER,
    references: {
      model: PerfilMensajeria,
      key: 'id'
    },
    allowNull: false
  },
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: cuenta_Mensajeria,
      key: 'id'
    },
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['codigo_perfil', 'codigo_cuenta']
    }
  ],
  freezeTableName: true,
  sequelize,
  timestamps: true,
  comment: 'Relacion entre la entidad Perfil y Cuenta.'
});