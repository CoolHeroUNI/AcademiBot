const { createHistorial } = require("./Transactions");
const S = require("../index");
const sequelize = require("../../database");

/**
 *
 * @param {{longitud_en_bytes:Number, mime:String, hash:String, ruta:String}[]} listaAtributos
 * @param usuario
 * @returns {Promise<{evento: any, recursos: *}>}
 */
async function creaRecursos(listaAtributos, usuario = null) {
    let duracion_en_ms = 0, error = null, recursos;
    const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
    const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'crea-recursos'}, logging, rejectOnEmpty: true })).get('id');
    const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error }, { logging });
    try {
        recursos = await sequelize.transaction(async transaction => {
            const t_info = await S.Tipo_cuenta.findOne({ where: { nombre: 'recurso-info' }, logging, transaction, rejectOnEmpty: true });
            const t_obtencion = await S.Tipo_cuenta.findOne({ where: { nombre: 'recurso-obtencion' }, logging, transaction, rejectOnEmpty: true });
            let r = [];
            while (listaAtributos.length) {
                const subList = await Promise.all(listaAtributos.splice(0, 50).map(async atributos => {
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
                r = r.concat(subList);
            }
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

module.exports = creaRecursos;