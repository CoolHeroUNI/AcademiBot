const { createHistorial } = require("./Transactions");
const S = require("../Schema");
const sequelize = require("../config/database");

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

module.exports = actualizarInfoUsuario;