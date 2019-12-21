const obtenerUsuario_Canal = require("./operaciones/obtenerUsuario_Canal");
const obtenerCuentaMensajeria = require("./operaciones/obtenerCuentaMensajeria");
const modificarCuentaMensajeria = require("./operaciones/modificarCuentaMensajeria");
const sequelize = require("../../config/database");

module.exports = function actualizarMensaje(codigoIdentificador, nombreCanal, estaHabilitado = true, contenidoMensaje = null) {
  return sequelize.transaction(t => {
    return obtenerUsuario_Canal(codigoIdentificador, nombreCanal, t)
      .then(usuario_canal => obtenerCuentaMensajeria(usuario_canal.get('id')))
      .then(cuenta => modificarCuentaMensajeria(cuenta.get('id'), estaHabilitado, contenidoMensaje, t));
  })
};