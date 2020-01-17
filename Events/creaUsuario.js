const { createHistorial } = require("./Transactions");
const S = require("../Schema");
const sequelize = require("../config/database");

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

module.exports = creaUsuario;