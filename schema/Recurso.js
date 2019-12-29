const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");
const Recurso_info = require("./Recurso_info");
const RecursoCanal_Mensajeria = require("./Recurso-Canal_mensajeria");

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
  donado_por: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: true,
    defaultValue: null
  }
}, {
  initialAutoIncrement: 1000000000,
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  sequelize,
  tableName: 'recurso',
  underscored: true,
  comment: "Instancia recurso, se refiere a un archivo digital que puede ser académico o no, carece de tipología por el hecho de que solo se cuenta con recursos académicos y no académicos."
});

Recurso.belongsTo(Usuario, {
  foreignKey: { name: 'donado_por' },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  as: 'usuario'
});

Recurso.hasOne(Recurso_info, { foreignKey: { name: 'recurso_id' }, as: 'info' });
Recurso.hasMany(RecursoCanal_Mensajeria, { foreignKey: { name: 'recurso_id'}, as: 'canal' });

module.exports = Recurso;