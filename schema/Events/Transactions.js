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
  Recurso_obtencion,
  Recurso,
  RecursoCanal_mensajeria,
  Recurso_info
} = require("../");

const { findTipo_historial, findTipo_cuenta, findCanal_mensajeria } = require("./FasterOperations");

/**
 *
 * @param channelName
 * @param idCode
 * @returns {Promise<{cuentas:Array, usuario, usuario_cuentas:Array, tipos:Array, tiempo_ejecucion:Number}>}
 */
function createAndAssociateUser(channelName, idCode) {
  return sequelize.transaction(async t => {
    let tiempo_ejecucion = 0;
    const logging = (sql, time) => {tiempo_ejecucion += time; console.log(sql)};
    const canal = await findCanal_mensajeria(channelName, t, logging);
    let usuario = await Usuario.create({}, { transaction: t, logging });
    const usuario_id = usuario.get('id');
    let promesas = [
      findTipo_cuenta('usuario-info', t, logging),
      findTipo_cuenta('usuario-solicitud', t, logging),
      findTipo_cuenta('usuario-donacion', t, logging),
      findTipo_cuenta('usuario-canal_mensajeria', t, logging)
    ];
    const tipos = await Promise.all(promesas);
    promesas = tipos.map(tipo => {
      const tipo_cuenta_id = tipo.get('id');
      return Cuenta.create({ tipo_cuenta_id }, { transaction: t, logging})
    });
    const cuentas = await Promise.all(promesas);
    promesas = [
      Usuario_info.create({ id: cuentas[0].get('id'), usuario_id }, { transaction: t, logging }),
      Usuario_solicitud.create({ id: cuentas[1].get('id'), usuario_id }, { transaction: t, logging }),
      Usuario_donacion.create({ id: cuentas[2].get('id'), usuario_id }, { transaction: t, logging }),
      UsuarioCanal_mensajeria.create(
        { id: cuentas[3].get('id'), usuario_id, canal_mensajeria_id: canal.get('id'), codigo: idCode },
        { transaction: t, logging }
        )
    ];
    const usuario_cuentas = await Promise.all(promesas);
    usuario = await Usuario.findByPk(usuario_id, {
      include: [
        { model: Usuario_info, as: 'info' },
        { model: Usuario_solicitud, as: 'solicitud'},
        { model: Usuario_donacion, as: 'donacion' },
        { model: UsuarioCanal_mensajeria, as: 'canal' }
      ],
      transaction: t, logging
    });
    return {
      usuario,
      tipos,
      cuentas,
      usuario_cuentas,
      tiempo_ejecucion
    };
  });
}

/**
 *
 * @param event
 * @param account
 * @param attributes
 * @returns {Promise<Number>}
 */
function createHistorial(event, account, attributes = null) {
  const tipo_evento_id = event.get('tipo_evento_id');
  const evento_id = event.get('id');
  const tipo_cuenta_id = account.get('tipo_cuenta_id');
  const cuenta_id = account.get('id');
  return sequelize.transaction(async t => {
    let tiempo_ejecucion = 0;
    const logging = (sql, time) => {tiempo_ejecucion += time; console.log(sql)};
    const tipo_historial = await findTipo_historial(tipo_cuenta_id, tipo_evento_id, t, logging);
    await Historial.create({
      tipo_historial_id: tipo_historial.get('id'),
      cuenta_id,
      evento_id,
      atributos: attributes
    }, { transaction: t, logging });
    return tiempo_ejecucion;
  })
}

/**
 *
 * @param {{longitud_en_bytes:Number, mime:String, hash:String, ruta:String}} atributos
 * @param {Usuario} usuario
 * @returns {Promise<{ recurso, tiempo_ejecucion, cuentas }>}
 */
function createAndAssociateResource(atributos, usuario = null){
  return sequelize.transaction(async t => {
    let tiempo_ejecucion = 0;
    const extension = atributos.ruta.substr(atributos.ruta.lastIndexOf('.') + 1) || null;
    const logging = (sql, time) => {tiempo_ejecucion += time; console.log(sql)};
    let promesas = [
      findTipo_cuenta('recurso-info', t, logging),
      findTipo_cuenta('recurso-obtencion', t, logging)
    ];
    const tipos = await Promise.all(promesas);
    let recurso = await Recurso.create(atributos, { transaction: t, logging });
    const recurso_id = recurso.get('id');
    promesas = tipos.map(tipo => Cuenta.create({ tipo_cuenta_id: tipo.get('id') }, { transaction: t, logging }));
    const cuentas = await Promise.all(promesas);
    promesas = [
      Recurso_info.create({
        id: cuentas[0].get('id'),
        recurso_id,
        ruta: atributos.ruta,
        extension
      }, { transaction: t, logging }),
      Recurso_obtencion.create({ id: cuentas[1].get('id'), recurso_id }, { transaction: t, logging })
    ];
    await Promise.all(promesas);
    if (usuario) {
      await usuario.addRecurso(recurso, { transaction: t, logging });
      const donacion = usuario.get('donacion');
      await donacion.increment({ total: 1 }, { transaction: t, logging });
    }
    recurso = await Recurso.findByPk(recurso_id,
      { transaction: t, logging, include: [{ model: Recurso_obtencion, as: 'obtencion' }, { model: Recurso_info, as: 'info' }]}
      );
    return { recurso, tiempo_ejecucion, cuentas };
  })
}

/**
 *
 * @param {Usuario_solicitud} solicitud
 * @param {Recurso_obtencion} obtencion
 * @param {Boolean} exito
 */
function updateSolicitudObtencion(solicitud, obtencion, exito) {
  return sequelize.transaction(async t => {
    let tiempo_ejecucion = 0;
    const logging = (sql, time) => {tiempo_ejecucion += time; console.log(sql)};
    if (exito) {
      await solicitud.increment({ total_exitosas: 1, total: 1 }, { logging, transaction: t });
      await obtencion.increment({ total_exitosas: 1, total: 1 }, { logging, transaction: t });
    } else {
      await solicitud.increment({ total_fallidas: 1, total: 1 }, { logging, transaction: t });
      await obtencion.increment({ total_fallidas: 1, total: 1 }, { logging, transaction: t });
    }
    return tiempo_ejecucion;
  })
}

function associateResourceWithChannel(recurso, canal, tipo_archivo, codigo_reutilizacion = null) {
  return sequelize.transaction(async t => {
    let tiempo_ejecucion = 0;
    const logging = (sql, time) => {tiempo_ejecucion += time; console.log(sql)};
    const recurso_canal = await RecursoCanal_mensajeria.create({
      recurso_id: recurso.get('id'),
      canal_mensajeria_id: canal.get('id'),
      tipo_archivo,
      codigo_reutilizacion
    }, { transaction: t, logging });
    await recurso.addCanal_mensajeria(recurso_canal, { transaction: t, logging });
    return { recurso, tiempo_ejecucion };
  });
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

module.exports = {
  createAndAssociateUser,
  associateUserWithChannel,
  createHistorial,
  updateSolicitudObtencion,
  createAndAssociateResource
};