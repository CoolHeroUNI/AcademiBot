const cron = require('node-cron');
const jobReporte = require('./generaReportes');
const { randomPing } = require('../util');
const { pingInterval, ownUrl, jobs } = require("../config");
const { batchRecursos } = require('../Schema/Events');
const { ping, reporte, batch_recursos } = jobs;

module.exports = () => {
    if (!isNaN(pingInterval)) cron.schedule(ping, () => {
        randomPing(ownUrl, pingInterval);
    });
    cron.schedule(reporte, jobReporte);
    cron.schedule(batch_recursos, batchRecursos);
    console.log('Jobs scheduled.')
};