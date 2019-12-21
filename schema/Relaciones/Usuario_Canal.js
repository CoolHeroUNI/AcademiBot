const { DataTypes, Model } = require ("sequelize");
const sequelize = require ("../../config/database");
const CanalMensajeria = require ("../Entidades/CanalMensajeria");
const Usuario = require ("../Entidades/Usuario");

class Usuario_Canal extends Model {  }

Usuario_Canal.init({
  codigo_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
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
  },
  codigo_identificador: {
    type: DataTypes.STRING,
    allowNull: false
  },
  informacion_publica: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }

}, {
  indexes: [
    {
      unique: true,
      fields: ['codigo_identificador', 'codigo_canal']
    }
  ],
  sequelize,
  freezeTableName: true,
  timestamps: false,
  comment: 'Relacion entre las entidades Usuario y Canal de mensajeria'
});
module.exports = Usuario_Canal;