const crearUsuario = require("./operaciones/crearUsuario");
const crearCuentaDonador = require("./operaciones/crearCuentaDonador");
const crearCuentaSolicitante = require("./operaciones/crearCuentaSolicitante");
const crearPerfilMensajeria = require("./operaciones/crearPerfilMensajeria");
const crearCuentaPerfilMensajeria = require("./operaciones/crearCuentaPerfilMensajeria");
const crearCuentaEstudiante = require("./operaciones/crearCuentaEstudiante");
const crearEstudiante = require("./operaciones/crearEstudiante");
const crearRelacionEstudianteUsuario = require("./operaciones/crearRelacionEstudianteUsuario");
const sequelize = require("../../config/database");

module.exports = function (nombreCanal, codigoIdentificador) {
  return sequelize.transaction(async t => {
    const usuario = await crearUsuario(t);
    const usuarioId = usuario.get('id');
    const promesaCuentaDonador = crearCuentaDonador(usuarioId, t);
    const promesaCuentaSolicitante = crearCuentaSolicitante(usuarioId, t);
    const promesaCuentaMensajeria = crearPerfilMensajeria(usuarioId, nombreCanal, codigoIdentificador, t)
      .then(perfil => crearCuentaPerfilMensajeria(perfil.get('id'), t));
    const estudiante = await crearEstudiante(t);
    const promesaCuentaEstudiante = crearCuentaEstudiante(estudiante.get('id'), t);
    const promesaEstudianteUsuario = crearRelacionEstudianteUsuario(usuarioId,  estudiante.get('id'), t);

    return Promise.all([
      promesaCuentaMensajeria,
      promesaCuentaSolicitante,
      promesaCuentaDonador,
      promesaCuentaEstudiante,
      promesaEstudianteUsuario
    ])
      .then(() => usuarioId);
  })
};