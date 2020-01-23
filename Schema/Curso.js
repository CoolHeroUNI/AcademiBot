const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database");

class Curso extends Model {
  enviable() {
    return {
      title: this.get('nombre').toUpperCase(),
      subtitle: `Sis. de evaluación: ${this.get('sistema_calificacion_id')}\nCréditos: ${this.get('creditos')}`,
      buttons: [
        {
          title : `MATERIAL ${this.get('id')}`,
          payload : `SetCurso:${this.get('id')}`
        }
      ]
    };
  }
}

Curso.init({
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  creditos: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  sistema_calificacion_id: {
    type: DataTypes.CHAR(1),
    allowNull: false
  }
}, {
  tableName: 'curso',
  timestamps: true,
  createdAt: false,
  sequelize,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'sistema_calificacion_id' }]
    }
  ],
  comment: 'Esta entidad almacena atributos sobre el Curso.'
});

module.exports = Curso;