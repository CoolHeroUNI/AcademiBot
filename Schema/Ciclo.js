const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database");

class Ciclo extends Model {
  enviable() {
    return {
      title: this.get('nombre'),
      payload: `SetCiclo:${this.get('id')}`
    }
  }
}

Ciclo.init({
  id: {
    type: DataTypes.TINYINT.UNSIGNED,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(30),
    allowNull: false
  }
}, {
  tableName: 'ciclo',
  timestamps: false,
  sequelize,
  underscored: true,
  comment: 'Esta entidad almacena atributos sobre el Ciclo academico.'
});

module.exports = Ciclo;