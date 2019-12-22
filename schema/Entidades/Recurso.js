const { DataTypes, Model, Op } = require("sequelize");
const sequelize = require("../../config/database");

class Recurso extends Model {  }

Recurso.init({
  ruta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  extension: {
    type: DataTypes.STRING({ length: 10 }),
    allowNull: true,
    defaultValue: null
  },
  habilitado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  timestamps: true,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['ruta'],
      where: {
        habilitado: true
      }
    },
    {
      unique: false,
      fields: ['extension'],
      where: {
        extension: {
          [Op.ne]: null
        }
      }
    }
  ],
  sequelize,
  comment: 'Entidad Recurso, esta representa un archivo para distribuir.'
});
module.exports = Recurso;