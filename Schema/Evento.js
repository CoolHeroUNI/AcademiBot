const { Model, DataTypes } = require("sequelize");
const sequelize = require("../database");

class Evento extends Model {  }

Evento.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
  },
  tipo_evento_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    allowNull: false
  },
  duracion_en_ms: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  error: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null
  }
}, {
  initialAutoIncrement: 1000000000,
  tableName: 'evento',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  underscored: true,
  sequelize,
  comment: "Instancia evento, representa a un evento real, hereda atributos de un tipo de evento."
});

module.exports = Evento;