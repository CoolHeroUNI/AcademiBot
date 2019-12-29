const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Tipo_historial = require("./Tipo_historial");
const Cuenta = require("./Cuenta");
const Evento = require("./Evento");

class Historial extends Model {  }

Historial.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
  },
  tipo_historial_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
    references: {
      model: Tipo_historial,
      key: 'id'
    },
    allowNull: false
  },
  cuenta_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: false
  },
  evento_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    allowNull: false
  },
  atributos: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  initialAutoIncrement: 1000000000,
  tableName: 'historial',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  underscored: true,
  sequelize,
  comment: "Instancia evento, representa a un evento real, hereda atributos de un tipo de evento."
});

Historial.belongsTo(Cuenta, { foreignKey: { name: 'cuenta_id' }, as: 'cuenta' });
Historial.belongsTo(Evento, { foreignKey: { name: 'evento_id' }, as:'evento' });

module.exports = Historial;