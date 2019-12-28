const { DataTypes, Model, Op } = require("sequelize");
const sequelize = require("../../config/database");
const Recurso = require("./Recurso");
const Canal_mensajeria = require("./Canal_mensajeria");

class RecursoCanal_mensajeria extends Model {  }

RecursoCanal_mensajeria.init({
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    references: {
      model: Recurso,
      key: 'id'
    },
    primaryKey: true
  },
  canal_mensajeria_id: {
    type: DataTypes.STRING(10),
    references: {
      model: Canal_mensajeria,
      key: 'id'
    },
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
      unique: true,
      fields: [{ name: 'canal_mensajeria_id' }, { name: 'codigo_reutilizacion' }],
      where: { codigo_reutilizacion: { [Op.ne]: null }}
    },
    {
      unique: false,
      fields: [{ name: 'tipo_archivo' }]
    }
  ]
});