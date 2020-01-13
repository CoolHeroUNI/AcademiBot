const sequelize = require("../../../config/database");
const { Op } = require("sequelize");
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
  Tipo_evento,
  Recurso,
  Recurso_info,
  Recurso_obtencion,
  RecursoCanal_mensajeria
} = require("../index");
const dbCache = require("../../../config/databaseCache");

function findCanal_mensajeria (channelName, t, logging = console.log) {
  const searchString = "CANAL" + channelName;
  let canal = dbCache.get(searchString);
  if (canal) {
    return canal;
  }
  const promesa = Canal_mensajeria.findByPk(channelName, { rejectOnEmpty: true, transaction: t, logging });
  promesa.then(canal => dbCache.set(searchString, canal));
  return promesa;
}

function findTipo_cuenta (nombre, t, logging = console.log) {
  const searchString = "TIPO_CUENTA" + nombre;
  let tipo_cuenta = dbCache.get(searchString);
  if (tipo_cuenta) {
    return tipo_cuenta;
  }
  const promesa = Tipo_cuenta.findOne({ where: { nombre }, rejectOnEmpty: true, transaction: t, logging });
  promesa.then(tipo_cuenta => dbCache.set(searchString, tipo_cuenta));
  return promesa;
}

function findCuenta(cuenta_id, t, logging = console.log) {
  const searchString = "CUENTA" + cuenta_id;
  let cuenta = dbCache.get(searchString);
  if (cuenta) return cuenta;
  const promesa = Cuenta.findByPk(cuenta_id, { rejectOnEmpty: true, transaction: t, logging });
  promesa.then(cuenta => dbCache.set(searchString, cuenta));
  return promesa;
}

function findTipo_historial (tipo_cuenta_id, tipo_evento_id, t, logging = console.log) {
  const searchString = "TIPO_HISTORIAL" + tipo_cuenta_id + tipo_evento_id;
  let tipo_historial = dbCache.get(searchString);
  if (tipo_historial) {
    return tipo_historial;
  }
  const promesa = Tipo_historial.findOne({
    where: { tipo_cuenta_id, tipo_evento_id },
    rejectOnEmpty: true,
    transaction: t,
    logging
  });
  promesa.then(tipo_historial => dbCache.set(searchString, tipo_historial));
  return promesa;
}

function findTipo_evento (nombre, logging = console.log) {
  const searchString = "TIPO_EVENTO" + nombre;
  let tipo_evento = dbCache.get(searchString);
  if (tipo_evento) return tipo_evento;
  const promise = Tipo_evento.findOne({ where: { nombre }, rejectOnEmpty: true, logging });
  promise.then(tipo_evento => dbCache.set(searchString, tipo_evento));
  return promise;
}

async function findUsuario(channelName, idCode, t, logging = console.log) {
  const searchString = "ENCUENTRA_USUARIO" + channelName + idCode;
  let cuenta = dbCache.get(searchString);
  if (!cuenta) {
    cuenta = await UsuarioCanal_mensajeria.findOne({
      where: { canal_mensajeria_id: channelName, codigo: idCode },
      transaction: t,
      logging
    });
    if (!cuenta) return null;
    dbCache.set(searchString, cuenta);
  }
  return Usuario.findByPk(cuenta.get('usuario_id'), {
    include: [
      { model: Usuario_info, as: 'info' },
      { model: Usuario_solicitud, as: 'solicitud'},
      { model: Usuario_donacion, as: 'donacion' },
      { model: UsuarioCanal_mensajeria, as: 'canal', where: { canal_mensajeria_id: canal.get('id') } }
    ],
    transaction: t, logging
  });
}

async function findRecurso(channelName, ruta, es_visible = true) {
  const recurso = await Recurso.findOne({ include:
      [
        { model: Recurso_info, as: 'info', where: { ruta: { [Op.like]: `${ruta}%` }, es_visible } },
        { model: Recurso_obtencion, as: 'obtencion'},
        { model: RecursoCanal_mensajeria, as: 'canal', where: { canal_mensajeria_id: channelName } }
      ],
    rejectOnEmpty: true
  });
  recurso.setDataValue('canal', recurso.get('canal')[0]);
  return recurso;
}

async function findRecursos(channelName, ruta, es_visible = true) {
  const recursos = await Recurso.findAll({ include:
      [
        { model: Recurso_info, as: 'info', where: { ruta: { [Op.like]: `${ruta}%` }, es_visible } },
        { model: Recurso_obtencion, as: 'obtencion'},
        { model: RecursoCanal_mensajeria, as: 'canal', where: { canal_mensajeria_id: channelName } }
      ]
  });
  for (let recurso of recursos) {
    recurso.setDataValue('canal', recurso.get('canal')[0]);
  }
  return recursos;
}

module.exports = { findCanal_mensajeria, findTipo_cuenta, findTipo_evento, findTipo_historial, findCuenta, findUsuario, findRecurso, findRecursos };