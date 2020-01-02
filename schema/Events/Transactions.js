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
  Historial
} = require("../");

const { findTipo_historial, findTipo_cuenta, findCanal_mensajeria } = require("./FasterOperations");


/**
 *
 * @param channelName
 * @param idCode
 * @returns {Promise<{cuentas:Array, usuario, usuario_cuentas:Array, tipos:Array}>}
 */
function createAndAssociateUser(channelName, idCode) {
  return sequelize.transaction(async t => {
    const canal = await findCanal_mensajeria(channelName, t);
    const usuario = await Usuario.create({}, { transaction: t});
    const usuario_id = usuario.get('id');
    let promesas = [
      findTipo_cuenta('usuario-info', t),
      findTipo_cuenta('usuario-solicitud', t),
      findTipo_cuenta('usuario-donacion', t),
      findTipo_cuenta('usuario-canal_mensajeria', t)
    ];
    const tipos = await Promise.all(promesas);
    promesas = tipos.map(tipo => {
      const tipo_cuenta_id = tipo.get('id');
      return Cuenta.create({ tipo_cuenta_id }, { transaction: t})
    });
    const cuentas = await Promise.all(promesas);
    promesas = [
      Usuario_info.create({ id: cuentas[0].get('id'), usuario_id }, { transaction: t}),
      Usuario_solicitud.create({ id: cuentas[1].get('id'), usuario_id }, { transaction: t}),
      Usuario_donacion.create({ id: cuentas[2].get('id'), usuario_id }, { transaction: t}),
      UsuarioCanal_mensajeria.create(
        { id: cuentas[3].get('id'), usuario_id, canal_mensajeria_id: canal.get('id'), codigo: idCode },
        { transaction: t }
        )
    ];
    const usuario_cuentas = await Promise.all(promesas);
    return {
      usuario,
      tipos,
      cuentas,
      usuario_cuentas
    };
  });
}

function createHistorialOfUserCreation(eventId, eventTypeId, accountsType, accounts) {
  const tipo_evento_id = eventTypeId;
  const evento_id = eventId;
  return sequelize.transaction(async t => {
    let promesas = accountsType.map(tipo => {
      return findTipo_historial(tipo.get('id'), tipo_evento_id, t)
    });
    const tipos_historial = await Promise.all(promesas);
    promesas = [];
    for (let i = 0; i < tipos_historial.length; i++) {
      promesas.push(Historial.create({
        tipo_historial_id: tipos_historial[i].get('id'),
        cuenta_id: accounts[i].get('id'),
        evento_id,
        atributos: {  }
      }, { transaction: t }))
    }
    return await Promise.all(promesas);
  })
}

function associateUserWithChannel (user, channelName, idCode) {
  return sequelize.transaction(async t => {
    // Asegura la existencia del canal de mensajeria en la base de datos.
    const canal = await Canal_mensajeria.findByPk(channelName, { rejectOnEmpty: true, transaction: t });
    const tipo_cuenta = await Tipo_cuenta.findOne({ where: { nombre: 'usuario-canal_mensajeria' }, rejectOnEmpty: true, transaction: t });
    const cuenta = await Cuenta.create({ tipo_cuenta_id: tipo_cuenta.get('id') }, { transaction: t});
    await UsuarioCanal_mensajeria.create({
      id: cuenta.get('id'),
      usuario_id: user.get('id'),
      canal_mensajeria_id: canal.get('id'),
      codigo: idCode
    }, { transaction: t });
  });
}

module.exports = { createAndAssociateUser, associateUserWithChannel, createHistorialOfUserCreation };