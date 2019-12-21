const { DataTypes, Model, Op } = require("sequelize");
const sequelize = require("../../config/database");

class cuenta_Estudiante extends Model {  }

cuenta_Estudiante.init({
  ciclo_relativo_indicado: {
    type: DataTypes.TINYINT({ unsigned: true }),
    allowNull: true,
    defaultValue: null
  },
  especialidad_indicada: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: false,
      fields: ['ciclo_relativo_indicado'],
      where: {
        ciclo_relativo_indicado: {
          [Op.ne]: null
        }
      }
    },
    {
      unique: false,
      fields: ['especialidad_indicada'],
      where: {
        especialidad_indicada: {
          [Op.ne]: null
        }
      }
    }
  ],
  freezeTableName: true,
  sequelize,
  comment: 'Cuenta para el estudiante, guarda informacion sobre el ciclo indicado y la especialidad indicada.'
});
module.exports = cuenta_Estudiante;