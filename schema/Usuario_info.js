const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cuenta = require("./Cuenta");
const Especialidad = require("./Especialidad");
const Ciclo = require("./Ciclo");


class Usuario_info extends Model {  }

Usuario_info.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    primaryKey: true,
    references: {
      model: Cuenta,
      key: 'id'
    }
  },
  usuario_id: {
    type: DataTypes.INTEGER({ length: 10, zerofill: true, unsigned: true}),
    unique: true
  },
  acepta_publicidad: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  ciclo_id: {
    type: DataTypes.TINYINT.UNSIGNED,
    references: {
      model: Ciclo,
      key: 'id'
    },
    allowNull: true,
    defaultValue: null
  },
  especialidad_id: {
    type: DataTypes.STRING(10),
    references: {
      model: Especialidad,
      key: 'id'
    },
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
  createdAt: false,
  underscored: true,
  sequelize,
  comment: "Cuenta de información para el usuario, posee informacion de la ruta que tiene especificada, así como el ciclo y especialidad."
});

module.exports = Usuario_info;