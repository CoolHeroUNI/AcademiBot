const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class Recurso_info extends Model {
  getFileName() {
    const list = this.get('ruta').split('/');
    return list[list.length - 1];
  }
  getShortName() {
    const partes = this.getFileName().split('-');
    partes.pop();
    return partes.join('-');
  }
  matchesText(text) {
    const expression = new RegExp(this.getShortName(), 'i');
    const expressionText = new RegExp(text);
    const ownShortName = this.getShortName();
    if (expressionText.test(ownShortName)) return true;
    return (expression.test(text));
  }
  getPage() {
    const last = this.getFileName().split('-').pop();
    const dotIndex = last.lastIndexOf('.');
    return parseInt(last.substring(0, dotIndex));
  }
}

Recurso_info.init({
  id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    primaryKey: true
  },
  recurso_id: {
    type: DataTypes.INTEGER({ length: 10, unsigned: true, zerofill: true}),
    unique: true
  },
  ruta: {
    type: DataTypes.STRING,
    allowNull: false
  },
  es_visible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  es_academico: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  extension: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'recurso-info',
  timestamps: true,
  createdAt: false,
  sequelize,
  indexes: [
    {
      unique: false,
      fields: [{ name: 'ruta' }],
      where: { es_visible: true }
    }
  ],
  underscored: true,
  comment: "Cuenta de información de recurso, útil para manejar información como la ruta en un sistema de archivos, extension y si el recurso es visible para los usuarios.\nPosee cierta redundancia con respecto a la extension, ya que esta se recalcula en funcion a la ruta."
});

module.exports = Recurso_info;