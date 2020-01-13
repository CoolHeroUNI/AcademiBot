const { createHistorial } = require("./Transactions");
const S = require("../index");
const sequelize = require("../../../config/database");

async function mensajeTexto(usuario, contenido = null) {
  let duracion_en_ms = 0;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'recepcion-mensaje'}, logging, rejectOnEmpty: true })).get('id');
  const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error: null }, { logging });
  const mensajeria = usuario.get('canal');
  try {
    await sequelize.transaction(async transaction => {
      await mensajeria.increment({ total_mensajes_enviados: 1 }, { transaction, logging });
      const cuenta = await S.Cuenta.findByPk(mensajeria.get('id'), { transaction, logging });
      duracion_en_ms += await createHistorial(evento, cuenta, transaction, { contenido });
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment({ duracion_en_ms });
  await evento.reload();
  return { evento };
}

async function actualizarEnvio(usuario, recurso, exito) {
  let duracion_en_ms = 0;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'envio-recurso'}, logging, rejectOnEmpty: true })).get('id');
  const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error: null }, { logging });
  const solicitud = usuario.get('solicitud');
  const obtencion = recurso.get('obtencion');
  const canal = usuario.get('canal').get('canal_mensajeria_id');
  try {
    await sequelize.transaction(async transaction => {
      if (exito) {
        await solicitud.increment({ total_exitosas: 1, total: 1 }, { logging, transaction });
        await obtencion.increment({ total_exitosas: 1, total: 1 }, { logging, transaction });
      } else {
        await solicitud.increment({ total_fallidas: 1, total: 1 }, { logging, transaction });
        await obtencion.increment({ total_fallidas: 1, total: 1 }, { logging, transaction });
      }
      const c_s = await S.Cuenta.findByPk(solicitud.get('id'), { transaction, logging });
      const c_o = await S.Cuenta.findByPk(obtencion.get('id'), { transaction, logging });
      duracion_en_ms += await createHistorial(evento, c_s, transaction, { exito, canal });
      duracion_en_ms += await createHistorial(evento, c_o, transaction, { exito, canal });
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment( { duracion_en_ms });
  await evento.reload();
  return { evento };
}

async function actualizarInfoUsuario(usuario, atribs) {
  let duracion_en_ms = 0;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'actualizar-usuario'}, logging, rejectOnEmpty: true })).get('id');
  const evento = await S.Evento.create({
    tipo_evento_id,
    duracion_en_ms: 0,
    error: null
  }, { logging });
  try  {
    await sequelize.transaction(async transaction => {
      const atributos = { nuevos: { }, antiguos: { } };
      const info = await usuario.getInfo({ transaction, logging });
      for (let key of Object.keys(atribs)) {
        info.set(key, atribs[key]);
      }
      let changed = info.changed();
      if (changed) {
        for (let key of changed) {
          atributos.nuevos[key] = info.get(key);
          atributos.antiguos[key] = info.previous(key);
        }
        await info.save({ transaction, logging });
        await info.reload({ transaction, logging });
      }
      const cuenta = await S.Cuenta.findByPk(info.get('id'), { transaction, logging });
      duracion_en_ms += await createHistorial(evento, cuenta, transaction, atributos);
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment({ duracion_en_ms });
  await evento.reload();
  return { evento };
}

async function creaUsuario(canal, idCode, publicInfo = null) {
  let duracion_en_ms = 0, error = null;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento = await S.Tipo_evento.findOne({ where: { nombre: 'crea-usuario'}, logging, rejectOnEmpty: true });
  const tipo_evento_id = tipo_evento.get('id');
  const evento = await S.Evento.create({
    tipo_evento_id,
    duracion_en_ms: 0,
    error
  }, { logging });
  let usuario;
  try {
    usuario = await sequelize.transaction(async transaction => {
      let usuario = await S.Usuario.create({}, { transaction, logging });
      const usuario_id = usuario.get('id');
      let promesas = [
        S.Tipo_cuenta.findOne({ where: { nombre: 'usuario-info' }, transaction, logging, rejectOnEmpty: true }),
        S.Tipo_cuenta.findOne({ where: { nombre: 'usuario-solicitud' }, transaction, logging, rejectOnEmpty: true }),
        S.Tipo_cuenta.findOne({ where: { nombre: 'usuario-donacion' }, transaction, logging, rejectOnEmpty: true }),
        S.Tipo_cuenta.findOne({ where: { nombre: 'usuario-canal_mensajeria' }, transaction, logging, rejectOnEmpty: true })
      ];
      const tipos = await Promise.all(promesas);
      promesas = tipos.map(tipo => {
        const tipo_cuenta_id = tipo.get('id');
        return S.Cuenta.create({ tipo_cuenta_id }, { transaction, logging })
      });
      const cuentas = await Promise.all(promesas);
      promesas = [
        S.Usuario_info.create({ id: cuentas[0].get('id'), usuario_id }, { transaction, logging }),
        S.Usuario_solicitud.create({ id: cuentas[1].get('id'), usuario_id }, { transaction, logging }),
        S.Usuario_donacion.create({ id: cuentas[2].get('id'), usuario_id }, { transaction, logging }),
        S.UsuarioCanal_mensajeria.create(
          {
            id: cuentas[3].get('id'),
            usuario_id,
            canal_mensajeria_id: canal.get('id'),
            codigo: idCode,
            informacion_publica: publicInfo
          },
          { transaction, logging }
        )
      ];
      await Promise.all(promesas);
      usuario = await S.Usuario.findByPk(usuario_id, {
        include: [
          { model: S.Usuario_info, as: 'info' },
          { model: S.Usuario_solicitud, as: 'solicitud' },
          { model: S.Usuario_donacion, as: 'donacion' },
          { model: S.UsuarioCanal_mensajeria, as: 'canal', where: { canal_mensajeria_id: canal.get('id') } }
        ],
        transaction, logging
      });
      usuario.setDataValue('canal', usuario.get('canal')[0]);
      for (let cuenta of cuentas) {
        duracion_en_ms += await createHistorial(evento, cuenta, transaction);
      }
      return usuario;
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment({ duracion_en_ms });
  await evento.reload();
  return { evento, usuario };
}

/**
 *
 * @param {{longitud_en_bytes:Number, mime:String, hash:String, ruta:String}[]} listaAtributos
 * @param usuario
 * @returns {Promise<{evento: any, recursos: *}>}
 */
async function creaRecursos(listaAtributos, usuario = null) {
  let duracion_en_ms = 0, error = null, recursos;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'crea-recurso'}, logging, rejectOnEmpty: true })).get('id');
  const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error }, { logging });
  try {
    recursos = await sequelize.transaction(async transaction => {
      const t_info = await S.Tipo_cuenta.findOne({ where: { nombre: 'recurso-info' }, logging, transaction, rejectOnEmpty: true });
      const t_obtencion = await S.Tipo_cuenta.findOne({ where: { nombre: 'recurso-obtencion' }, logging, transaction, rejectOnEmpty: true });
      const r = await Promise.all(listaAtributos.map(async atributos => {
        const extension = atributos.ruta.substr(atributos.ruta.lastIndexOf('.') + 1) || null;
        let recurso = await S.Recurso.create(atributos, { transaction, logging });
        const recurso_id = recurso.get('id');
        const c_info = await S.Cuenta.create({ tipo_cuenta_id: t_info.get('id') }, { logging, transaction });
        const c_obtencion = await S.Cuenta.create({ tipo_cuenta_id: t_obtencion.get('id') }, { logging, transaction });
        await S.Recurso_info.create({
          id: c_info.get('id'),
          recurso_id,
          ruta: atributos.ruta,
          extension }, { logging, transaction });
        await S.Recurso_obtencion.create({ id: c_obtencion.get('id'), recurso_id }, { logging, transaction });
        if (usuario) usuario.addRecurso(recurso, { transaction, logging });
        duracion_en_ms += await createHistorial(evento, c_info, transaction);
        duracion_en_ms += await createHistorial(evento, c_obtencion, transaction);
        return S.Recurso.findByPk(recurso_id,
          { transaction, logging, include: [{ model: S.Recurso_obtencion, as: 'obtencion' }, { model: S.Recurso_info, as: 'info' }]}
        );
      }));
      if (usuario) {
        const donacion = usuario.get('donacion');
        const cuenta = await S.Cuenta.findByPk(donacion.get('id'), { transaction, logging });
        duracion_en_ms += await createHistorial(evento, cuenta, transaction, { cantidad: r.length });
      }
      return r;
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment({ duracion_en_ms });
  await evento.reload();
  return { evento, recursos };
}

async function actualizarInfoRecurso(recurso, atribs) {
  let duracion_en_ms = 0, error = null;
  const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
  const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'actualizar-recurso'}, logging, rejectOnEmpty: true })).get('id');
  const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error }, { logging });
  const info = recurso.get('info');
  try {
    await sequelize.transaction(async transaction => {
      const atributos = { nuevos: { }, antiguos: { } };
      await info.reload({ transaction, logging });
      for (let key of Object.keys(atribs)){
        info.set(key, atribs[key]);
      }
      let changed = info.changed();
      if (changed) {
        for (let key of changed) {
          atributos.nuevos[key] = info.get(key);
          atributos.antiguos[key] = info.previous(key);
        }
        await info.save({ transaction, logging });
        await info.reload({ transaction, logging });
      }
      const cuenta = await S.Cuenta.findByPk(info.get('id'), { transaction, logging });
      duracion_en_ms += await createHistorial(evento, cuenta, transaction, atributos);
    });
  } catch (e) {
    console.error(e);
    await evento.update({ error: Object(e) });
  }
  await evento.increment({ duracion_en_ms });
  await evento.reload();
  return { evento };
}

/**
 *
 * @param recurso
 * @param canal
 * @param {{tipo_archivo:String, codigo_reutilizacion:String}} atributos
 */
/**async function crearRecursoCanal(recurso, canal, atributos) {
  const tipo_evento = await findTipo_evento('crea-recurso');
  const tipo_evento_id = tipo_evento.get('id');
  let error = null, duracion_en_ms = 0;
  try {
    duracion_en_ms = await associateResourceWithChannel(recurso, canal, atributos);
  } catch (e) {
    error = e;
  }
  await S.Evento.create({ tipo_evento_id, error, duracion_en_ms });
  if (error) throw error;
}**/

module.exports = {
  creaUsuario,
  creaRecursos,
  mensajeTexto,
  actualizarEnvio,
  actualizarInfoUsuario,
  actualizarInfoRecurso
};
