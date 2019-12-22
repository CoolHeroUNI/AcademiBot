const Estudiante = require("../../Entidades/Estudiante");

module.exports = async function (t) {
  return Estudiante.create({}, { transaction: t });
};