const crearUsuario = require("./operaciones/crearUsuario");
const crearCuentaDonador = require("./operaciones/crearCuentaDonador");
const crearCuentaSolicitante = require("./operaciones/crearCuentaSolicitante");
const crearPerfilMensajeria = require("./operaciones/crearPerfilMensajeria");
const crearCuentaPerfilMensajeria = require("./operaciones/crearCuentaPerfilMensajeria");
const sequelize = require("../../config/database");

module.exports = function crearTodo(nombreCanal, codigoIdentificador) {
  sequelize.transaction(t => {
    return crearUsuario(t)
      .then(usuario => {
        const usuarioId = usuario.get('id');
        const promesaCuentaDonador = crearCuentaDonador(usuarioId, t);
        const promesaCuentaSolicitante = crearCuentaSolicitante(usuarioId, t);
        const promesaPerfil = crearPerfilMensajeria(usuarioId, nombreCanal, codigoIdentificador, t)
          .then(perfil => crearCuentaPerfilMensajeria(perfil.get('id'), t));
        return Promise.all([promesaPerfil, promesaCuentaSolicitante, promesaCuentaDonador]);
      })
  })

};