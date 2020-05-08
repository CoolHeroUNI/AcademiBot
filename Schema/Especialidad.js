const { DataTypes, Model } = require("sequelize");
const sequelize = require("../database");

class Especialidad extends Model {
  enviable() {
    return {
      title: this.get('nombre').toUpperCase(),
      subtitle: this.get('descripcion'),
      buttons: [
        {
          title : `ELEGIR ${this.get('id')}`,
          payload : `SetEspecialidad:${this.get('id')}`
        }
      ]
    };
  }
}

Especialidad.init({
  id: {
    type: DataTypes.STRING(10),
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  facultad_id: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
},{
  indexes: [
    {
      unique: true,
      fields: [{ name: 'nombre' }]
    }
  ],
  comment: 'Esta entidad almacena atributos de la Especialidad.',
  tableName: 'especialidad',
  timestamps: false,
  underscored: true,
  sequelize
});
module.exports = Especialidad;
