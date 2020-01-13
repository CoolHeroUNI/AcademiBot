const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Recurso_obtencion extends Model {  }

Recurso_obtencion.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true
  },
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    unique: true,
    allowNull: false
  },
  total_exitosas: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  total_fallidas: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  total: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  fecha_promedio: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'recurso-obtencion',
  timestamps: true,
  createdAt: false,
  sequelize,
  underscored: true,
  hasTrigger: true,
  comment: "Cuenta de las obtenciones que se realizaron al recurso."
});

module.exports = Recurso_obtencion;