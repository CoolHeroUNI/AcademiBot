const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Recurso_obtencion extends Model {  }

Recurso_obtencion.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true
  },
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    unique: true
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
  comment: "Cuenta de las obtenciones que se realizaron al recurso."
});

Recurso_obtencion.beforeUpdate(async (cuenta, options) => {
  cuenta.fecha_promedio = await sequelize.query("SELECT CALC_MEAN_DATE(?,?)", {
    replacements: [cuenta.fecha_promedio.toLocaleString(), cuenta.total],
    plain: true,
    transaction: options.transaction
  });
});
module.exports = Recurso_obtencion;