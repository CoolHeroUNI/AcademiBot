const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Tipo_historial extends Model {  }

Tipo_historial.init({
  id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  underscored: true,
  sequelize,
  tableName: 'tipo_historial',
  comment: "Tipología de historial, correspondiente a los diferentes tipos de eventos y cada uno registra diferentes cambios en cuentas."
});

module.exports = Tipo_historial;