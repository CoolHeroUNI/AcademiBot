const { createHistorial } = require("./Transactions");
const S = require("../Schema");
const sequelize = require("../config/database");

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

module.exports = mensajeTexto;