const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class RecursoCanal_mensajeria extends Model {  }

RecursoCanal_mensajeria.init({
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true
  },
  canal_mensajeria_id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  tipo_archivo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  codigo_reutilizacion: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: true
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'recurso-canal_mensajeria',
  sequelize,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'tipo_archivo' }]
    }
  ]
});
module.exports = RecursoCanal_mensajeria;