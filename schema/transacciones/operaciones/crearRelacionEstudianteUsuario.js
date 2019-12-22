const Estudiante_Usuario = require("../../Relaciones/Estudiante_Usuario");
module.exports = async function (idUsuario, idEstudiante, t) {
  return Estudiante_Usuario.create({
    codigo_estudiante: idEstudiante,
    codigo_usuario: idUsuario
  }, { transaction: t });
};