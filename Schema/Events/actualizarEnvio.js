const { createHistorial } = require("./Transactions");
const S = require("../index");
const sequelize = require("../../database");

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

module.exports = actualizarEnvio;