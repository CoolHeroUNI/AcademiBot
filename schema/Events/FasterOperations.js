const sequelize = require("../../config/database");
const {
  Tipo_cuenta,
  Cuenta,
  Usuario,
  Usuario_info,
  Usuario_solicitud,
  Usuario_donacion,
  UsuarioCanal_mensajeria,
  Canal_mensajeria,
  Tipo_historial,
  Historial,
  Tipo_evento
} = require("../");
const dbCache = require("../../config/databaseCache");

function findCanal_mensajeria (channelName, t) {
  const searchString = "CANAL" + channelName;
  let canal = dbCache.get(searchString);
  if (canal) {
    return canal;
  }
  const promesa = Canal_mensajeria.findByPk(channelName, { rejectOnEmpty: true, transaction: t });
  promesa.then(canal => dbCache.set(searchString, canal));
  return promesa;
}

function findTipo_cuenta (nombre, t) {
  const searchString = "TIPO_CUENTA" + nombre;
  let tipo_cuenta = dbCache.get(searchString);
  if (tipo_cuenta) {
    return tipo_cuenta;
  }
  const promesa = Tipo_cuenta.findOne({ where: { nombre }, rejectOnEmpty: true, transaction: t });
  promesa.then(tipo_cuenta => dbCache.set(searchString, tipo_cuenta));
  return promesa;
}

function findTipo_historial (tipo_cuenta_id, tipo_evento_id, t) {
  const searchString = "TIPO_HISTORIAL" + tipo_cuenta_id + tipo_evento_id;
  let tipo_historial = dbCache.get(searchString);
  if (tipo_historial) {
    return tipo_historial;
  }
  const promesa = Tipo_historial.findOne({
    where: { tipo_cuenta_id, tipo_evento_id },
    rejectOnEmpty: true,
    transaction: t
  });
  promesa.then(tipo_historial => dbCache.set(searchString, tipo_historial));
  return promesa;
}

function findTipo_evento (nombre) {
  const searchString = "TIPO_EVENTO" + nombre;
  let tipo_evento = dbCache.get(searchString);
  if (tipo_evento) return tipo_evento;
  const promise = Tipo_evento.findOne({ where: { nombre: 'crea-usuario' }, rejectOnEmpty: true });
  promise.then(tipo_evento => dbCache.set(searchString, tipo_evento));
  return promise;
}

module.exports = { findCanal_mensajeria, findTipo_cuenta, findTipo_evento, findTipo_historial};