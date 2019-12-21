const Usuario = require("../../Entidades/Usuario");

module.exports = async function crearUsuario(t) {
  return Usuario.create({}, { transaction: t });
};