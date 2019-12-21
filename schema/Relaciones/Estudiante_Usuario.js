const { DataTypes, Model } = require("sequelize");
const sequelize = require("../../config/database");
const Estudiante = require("../Entidades/Estudiante");
const Usuario = require("../Entidades/Usuario");

class Estudiante_Usuario extends Model {  }

Estudiante_Usuario.init({
  codigo_estudiante: {
    type: DataTypes.INTEGER,
    references: {
      model: Estudiante,
      key: 'id'
    },
    allowNull: false
  },
  codigo_usuario: {
    type: DataTypes.INTEGER,
    references: {
      model: Usuario,
      key: 'id'
    },
    allowNull: false
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['codigo_estudiante', 'codigo_usuario']
    }
  ],
  sequelize,
  freezeTableName: true,
  comment: 'Relacion entre los roles de la persona Estudiante y Usuario.'
});
module.exports = Estudiante_Usuario;