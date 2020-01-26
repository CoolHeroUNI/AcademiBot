const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database");

class RecursoCanal_mensajeria extends Model {  }

RecursoCanal_mensajeria.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true
  },
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: false
  },
  canal_mensajeria_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  tipo_archivo: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  codigo_reutilizacion: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: null
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
    },
    {
      unique: true,
      fields: [{ name: 'recurso_id' }, { name: 'canal_mensajeria_id' }]
    }
  ]
});
module.exports = RecursoCanal_mensajeria;