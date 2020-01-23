const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Tipo_evento extends Model {  }

Tipo_evento.init({
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
  tableName: 'tipo_evento',
  comment: "Tipología de evento, define las clases de eventos que pueden darse durante el ciclo de vida del sistema."
});

module.exports = Tipo_evento;