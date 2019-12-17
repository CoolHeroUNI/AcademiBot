import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/database";
import Usuario from "../Entidades/Usuario";
import cuenta_Solicitante from "../Cuentas/cuenta_Solicitante";

export default class Usuario_CuentaSolicitante extends Model {  }

Usuario_CuentaSolicitante.init({
  codigo_usuario: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    }
  },
  codigo_cuenta: {
    type: DataTypes.INTEGER,
    references: {
      model: cuenta_Solicitante,
      key: 'id'
    }
  }
}, {
  timestamps: false,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['codigo_usuario', 'codigo_cuenta']
    }
  ],
  sequelize,
  comment: 'Relacion entre el Usuario y la cuenta de solicitante.'
});