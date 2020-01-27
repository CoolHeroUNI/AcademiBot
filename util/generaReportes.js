const pdf = require('html-pdf');
const pug = require('pug');
const options = { format: 'A4', timeout: 120000, border: '10mm' };
const S = require('../Schema');
const S3 = require('./classes/S3');
const { Op } = require('sequelize');
const { s3Config, awsCredentials: aws, reportes } = require('../config');
const path = require('path');

function dateToString(creado) {
    const seconds = creado.getSeconds().toString().length === 2 ? creado.getSeconds().toString() : '0' + creado.getSeconds().toString();
    const minutes = creado.getMinutes().toString().length === 2 ? creado.getMinutes().toString() : '0' + creado.getMinutes().toString();
    return `${creado.getDate()}/${creado.getMonth()+1}/${creado.getFullYear()} ${creado.getHours()}:${minutes}:${seconds}`;
}

module.exports = async () => {
    console.log('Starting report generation!');
    const s3 = new S3(aws.accessKeyId, aws.secretAccessKey, s3Config.region, s3Config.bucket, s3Config.cache);
    const day = 1000*60*60*24;
    const actual = new Date();
    const lastDate = new Date(actual.getTime() - Math.floor(day * reportes.intervalo));
    const fn = pug.compileFile(path.resolve(__dirname, './assets/report.pug'));
    let eventos = await S.Evento.findAll({ where: { createdAt: {[Op.gt]: lastDate, [Op.lt]: actual}} });
    let evs = [];
    while (eventos.length) {
        evs = evs.concat(await Promise.all(eventos.splice(0, 100).map(async e => {
            const creado = e.get('createdAt');
            return {
                id: e.get('id'),
                tipo: (await e.getTipo()).get('nombre'),
                duracion: e.get('duracion_en_ms'),
                error: e.get('error') ? 'Si' : 'No',
                cuentas: (await e.getHistorial()).length,
                fecha: dateToString(creado)
            }}
            )))
    }
    eventos = evs;
    const html = fn({ eventos, anteriorFecha: dateToString(lastDate), fechaActual: dateToString(actual)});
    pdf.create(html, options).toStream((e, stream) => {
        if (e) return console.error(e);
        s3.putObject(reportes.folder + Date.now() + '.pdf' , {
            Body: stream,
            ContentType: 'application/pdf'
        })
            .then(() => console.log('Finish report generation!'));
    })

};