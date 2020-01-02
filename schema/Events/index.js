const {
  createAndAssociateUser,
  associateUserWithChannel,
  createHistorialOfUserCreation
} = require("./Transactions");
const { findTipo_evento } = require("./FasterOperations");
const { Evento, Tipo_evento, Historial, Tipo_historial } = require("../");

async function createUser (channelName, idCode) {
  let duracion_en_ms = 0;
  let startTime = Date.now();
  const tipo_evento = await findTipo_evento('crea-usuario');
  duracion_en_ms += Date.now() - startTime;
  const tipo_evento_id = tipo_evento.get('id');
  startTime = Date.now();
  let evento = await Evento.create({ tipo_evento_id });
  duracion_en_ms += Date.now() - startTime;

  let error = null;
  startTime = Date.now();
  try {
    var { usuario, tipos, cuentas } = await createAndAssociateUser(channelName, idCode);
  } catch (e) {
    error = e;
  }
  duracion_en_ms += Date.now() - startTime;
  const evento_id = evento.get('id');
  if (error === null) {
    startTime = Date.now();
    try {
      await createHistorialOfUserCreation(evento_id, tipo_evento_id, tipos, cuentas);
    } catch (e) {
      error = e;
    }
    duracion_en_ms += Date.now() - startTime;
  }
  evento = await evento.update({
    duracion_en_ms,
    error
  });
  return { usuario, evento };
}

module.exports = { createUser };
