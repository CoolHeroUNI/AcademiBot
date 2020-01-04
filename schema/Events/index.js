const {
  createAndAssociateUser,
  associateUserWithChannel,
  createHistorial,
  updateSolicitudObtencion,
  createAndAssociateResource
} = require("./Transactions");
const { findTipo_evento, findCuenta } = require("./FasterOperations");
const { Evento } = require("../");

async function createUser (channelName, idCode) {
  const tipo_evento = await findTipo_evento('crea-usuario');
  const tipo_evento_id = tipo_evento.get('id');
  let error = null;
  try {
    var { usuario, cuentas, tiempo_ejecucion } = await createAndAssociateUser(channelName, idCode);
  } catch (e) {
    error = e;
  }
  let duracion_en_ms = tiempo_ejecucion || 0;
  let evento = await Evento.create({
    tipo_evento_id,
    duracion_en_ms,
    error
  });
  if (!error) {
    duracion_en_ms = 0;
    try {
      for (let cuenta of cuentas) {
        duracion_en_ms += await createHistorial(evento, cuenta);
      }
    } catch (e) {
      error = e;
      evento.update({ error });
    }
    await evento.increment({ duracion_en_ms });
  }
  if (error) throw error;

  return { usuario };
}

async function actualizarEnvio(usuario, recurso, exito) {
  const tipo_evento = await findTipo_evento('envio-recurso');
  const solicitante = usuario.get('solicitud');
  const obtenciones = recurso.get('obtencion');
  const tipo_evento_id = tipo_evento.get('id');
  let error = null, duracion_en_ms = 0;
  try {
    duracion_en_ms = await updateSolicitudObtencion(solicitante, obtenciones, exito);
  } catch (e) {
    error = e;
  }
  const evento = Evento.create({ tipo_evento_id, duracion_en_ms, error });
  if (error === null) {
    duracion_en_ms = 0;
    try {
      const cuenta_solicitud = await findCuenta(solicitante.get('id'));
      const cuenta_obtencion = await findCuenta(obtenciones.get('id'));
      duracion_en_ms += await createHistorial(evento, cuenta_solicitud, { exito });
      duracion_en_ms += await createHistorial(evento, cuenta_obtencion, { exito });
    } catch (e) {
      error = e;
      evento.update({ error });
    }
    await evento.increment({ duracion_en_ms });
  }
  if (error) throw error;
}

async function createResource(atributos, usuario = null) {
  const tipo_evento = await findTipo_evento('crea-recurso');
  const tipo_evento_id = tipo_evento.get('id');
  let error = null, duracion_en_ms = 0;
  try {
    var { recurso, tiempo_ejecucion, cuentas } = await createAndAssociateResource(atributos, usuario);
    duracion_en_ms += tiempo_ejecucion;
  } catch (e) {
    error = e;
  }
  const evento = await Evento.create({ tipo_evento_id, duracion_en_ms, error });
  if (error === null) {
    duracion_en_ms = 0;
    try {
      for (let cuenta of cuentas) {
        duracion_en_ms += await createHistorial(evento, cuenta);
      }
    } catch (e) {
      error = e;
      evento.update({ error });
    }
    await evento.increment({ duracion_en_ms });
  }
  if (error) throw error;
  return { recurso };
}

module.exports = { createUser, createResource };
