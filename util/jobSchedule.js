const cron = require('node-cron');
const rp = require('request-promise');
const jobReporte = require('./generaReportes');
const { ownUrl, jobs } = require("../config");
const { batchRecursos } = require('../Schema/Events');
const { ping, reporte, batch_recursos } = jobs;

module.exports = () => {
    if (ping) cron.schedule(ping, () => {
        rp.get(ownUrl);
    });
    cron.schedule(reporte, jobReporte);
    cron.schedule(batch_recursos, batchRecursos);
    console.log('Jobs scheduled.');
};