const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Recurso extends Model {  }

Recurso.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true,
    autoIncrement: true
  },
  es_visible: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  es_academico: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: true,
    defaultValue: null
  }
}, {
  initialAutoIncrement: 1000000000,
  timestamps: true,
  paranoid: true,
  sequelize,
  tableName: 'recurso',
  underscored: true,
  comment: "Instancia recurso, se refiere a un archivo digital que puede ser académico o no, carece de tipología por el hecho de que solo se cuenta con recursos académicos y no académicos."
});

module.exports = Recurso;