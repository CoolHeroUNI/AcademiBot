const Usuario = require("../../Entidades/Usuario");

module.exports = function crearUsuario(t) {
  return Usuario.create({}, { transaction: t });
};