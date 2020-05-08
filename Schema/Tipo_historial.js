const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Tipo_historial extends Model {  }

Tipo_historial.init({
  id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  tipo_evento_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false
  },
  tipo_cuenta_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  modelo_atributos: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: false,
  underscored: true,
  sequelize,
  indexes: [
    {
      unique: true,
      fields: [{ name: 'tipo_evento_id' }, { name: 'tipo_cuenta_id' }]
    }
  ],
  tableName: 'tipo_historial',
  comment: "Tipología de historial, correspondiente a los diferentes tipos de eventos y cada uno registra diferentes cambios en cuentas."
});

module.exports = Tipo_historial;