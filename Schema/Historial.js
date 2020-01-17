const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Historial extends Model {  }

Historial.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    autoIncrement: true
  },
  tipo_historial_id: {
    type: DataTypes.SMALLINT.UNSIGNED,
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
    allowNull: true,
    defaultValue: null
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



module.exports = Historial;