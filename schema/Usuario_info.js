const { Model, DataTypes, Op } = require("sequelize");
const sequelize = require("../config/database");

class Usuario_info extends Model {  }

Usuario_info.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    unique: true,
    allowNull: false
  },
  acepta_publicidad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ciclo_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    allowNull: true,
    defaultValue: null
  },
  especialidad_id: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null
  },
  curso_id: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: null
  },
  ruta: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'usuario-info',
  timestamps: true,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'especialidad_id' }, { name: 'ciclo_id' }],
      where: {
        especialidad_id: { [Op.ne]: null },
        ciclo_id: { [Op.ne]: null }
      }
    }
  ],
  createdAt: false,
  underscored: true,
  sequelize,
  comment: "Cuenta de información para el usuario, posee informacion de la ruta que tiene especificada, así como el ciclo y especialidad."
});

module.exports = Usuario_info;