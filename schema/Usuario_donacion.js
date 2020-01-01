const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Cuenta = require("./Cuenta");

class Usuario_donacion extends Model {  }

Usuario_donacion.init({
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
  total: {
    type: DataTypes.SMALLINT.UNSIGNED,
    defaultValue: 0
  },
  hora_promedio: {
    type: DataTypes.TIME,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'usuario-donacion',
  timestamps: true,
  createdAt: false,
  underscored: true,
  sequelize,
  comment: "Cuenta de donaciones, lleva registro de los recursos que ha donado el usuario."
});

Usuario_donacion.beforeUpdate(async (cuenta, options) => {
  let hora_promedio = await sequelize.query("SELECT CALC_MEAN_TIME(?,?)", {
    replacements: [cuenta.hora_promedio.toLocaleString(), cuenta.total - 1],
    plain: true,
    transaction: options.transaction
  });
  hora_promedio = Object.values(hora_promedio)[0];
  cuenta.hora_promedio = hora_promedio;
});
module.exports = Usuario_donacion;