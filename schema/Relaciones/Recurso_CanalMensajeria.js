const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Recurso = require("../Entidades/Recurso");
const CanalMensajeria = require("../Entidades/CanalMensajeria");

class Recurso_CanalMensajeria extends Model {  }

Recurso_CanalMensajeria.init({
  codigo_recurso: {
    type: DataTypes.INTEGER,
    references: {
      model: Recurso,
      key: 'id'
    },
    allowNull: false
  },
  codigo_canal: {
    type: DataTypes.INTEGER,
    references: {
      model: CanalMensajeria,
      key: 'id'
    },
    allowNull: false
  },
  tipo_recurso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  codigo_reutilizacion: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  freezeTableName: true,
  timestamps: true,
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['codigo_recurso', 'codigo_canal']
    }
  ],
  sequelize,
  comment: 'Relacion de detalle entre los recursos y canales de mensajeria, estos ultimos definen tipos de datos y codigos de reutilizacion.'
});
module.exports = Recurso_CanalMensajeria;