const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cuenta = require("./Cuenta");
const Recurso = require("./Recurso");

class Recurso_obtencion extends Model {  }

Recurso_obtencion.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true,
    references: {
      model: Cuenta,
      key: 'id'
    }
  },
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    references: {
      model: Recurso,
      key: 'id'
    }
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
  indexes: [
    {
      unique: true,
      fields: [{ name: 'ruta' }],
      where: { es_visible: true }
    }
  ],
  underscored: true,
  comment: "Cuenta de las obtenciones que se realizaron al recurso."
});