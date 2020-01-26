const { createHistorial } = require("./Transactions");
const S = require("../");
const sequelize = require("../../database");
const Facebook = require("../../util/classes/Facebook");
const S3 = require('../../util/classes/S3');
const { fbConfig, awsCredentials, s3Config } = require("../../config");

function determineAttachmentType(mime) {
    const [ type ] = mime.split('/');
    switch (type) {
        case 'audio':
            return 'audio';
        case 'image':
            return 'image';
        case 'video':
            return 'video';
        default:
            return 'file';
    }
}

async function batchRecursos() {
    let duracion_en_ms = 0, error = null;
    const logging = (sql, time) => {duracion_en_ms += time; console.log(sql + ' ' + time)};
    const tipo_evento_id = (await S.Tipo_evento.findOne({ where: { nombre: 'batch-recursos'}, logging, rejectOnEmpty: true })).get('id');
    const evento = await S.Evento.create({ tipo_evento_id, duracion_en_ms: 0, error }, { logging });
    const fb = new Facebook(fbConfig.token, fbConfig.version);
    const s3 = new S3(awsCredentials.accessKeyId, awsCredentials.secretAccessKey, s3Config.region, s3Config.bucket, s3Config.cache);
    try {
        await sequelize.transaction(async transaction => {
            const recursos = await S.Recurso.findAll({ include: [
                    { model: S.Recurso_info, as: 'info', where: { es_visible: true } },
                    { model: S.Recurso_obtencion, as: 'obtencion' },
                    { model: S.RecursoCanal_mensajeria, as: 'canal_mensajeria' }
                ], transaction, logging });
            const canalFB = await S.Canal_mensajeria.findByPk('FACEBOOK', { transaction, logging, rejectOnEmpty: true });
            while(recursos.length) {
                await Promise.all(recursos.splice(0, 25).map(async recurso => {
                    const atributos = { nuevos: { }};
                    const info = recurso.get('info');
                    let canal = recurso.get('canal_mensajeria').find(c => c.get('canal_mensajeria_id') === canalFB.get('id'));
                    const url = await s3.getPublicURL(info.get('ruta'), 60*60*25);
                    atributos.nuevos.url = url;
                    await info.update({ url }, { logging, transaction });
                    if (!canal) {
                        const tipo_cuenta_id = (await S.Tipo_cuenta.findOne({ where: { nombre: 'recurso-canal_mensajeria' }, transaction, rejectOnEmpty: true, logging })).get('id');
                        const cuenta = await S.Cuenta.create({ tipo_cuenta_id }, { transaction, logging });
                        const tipo_archivo = determineAttachmentType(recurso.get('mime'));
                        let attachment_id = null;
                        try {
                            attachment_id = await fb.getAttachmentId({ type: tipo_archivo, url });
                        } catch (e) {
                            console.error(e);
                        }
                        await S.RecursoCanal_mensajeria.create({
                            id: cuenta.get('id'),
                            recurso_id: recurso.get('id'),
                            canal_mensajeria_id: canalFB.get('id'),
                            tipo_archivo,
                            codigo_reutilizacion: attachment_id
                        }, { transaction, logging });
                        duracion_en_ms += await createHistorial(evento, cuenta, transaction, { nuevos:{ codigo_reutilizacion: attachment_id }});
                    }
                    const c = await S.Cuenta.findByPk(info.get('id'), { transaction, logging, rejectOnEmpty: true });
                    duracion_en_ms += await createHistorial(evento, c, transaction, atributos);
                }));
            }
        });
    } catch (e) {
        console.error(e);
        await evento.update({ error: Object(e) });
    }
    await evento.increment({ duracion_en_ms });
    await evento.reload();
    return { evento };
}
module.exports = batchRecursos;