const { wait } = require("../lib");
const recursos = require('./genRecursos');
const usuarios = require('./genUsuarios');
const mensajes = require('./genMessage');

const E = require('../lib/schema/Events');
const S = require('../lib/schema');
const sequelize = require('../config/database');

let users = [], resources = [], events = [], i = 0;


async function usersTest(concurrency) {
  const facebook = await S.Canal_mensajeria.findByPk('FACEBOOK');
  for (let u of usuarios) {
    events.push(E.creaUsuario(facebook, u));
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
  await Promise.all(events)
    .then(es => users = es.map(e => e.usuario));
  events = [];
}

async function resourcesTest(concurrency) {
  for (let atributos of recursos) {
    let usuario = null;
    if (Math.random() < 0.35) usuario = users.random();
    events.push(E.creaRecursos([atributos], usuario));
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
  await Promise.all(events)
    .then(es => resources = es.flatMap(e => e.recursos));
  events = [];
}

async function messageTest(concurrency) {
  const n = Math.floor(Math.random() * 7000) + 5000;
  for (let j = 0; j < n; j++) {
    let message = null;
    const usuario = users.random();
    if (Math.random() < 0.35) message = mensajes.random();
    events.push(E.mensajeTexto(usuario, message));
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
}

async function infoUsuarioTest(concurrency) {
  for (let usuario of users) {
    events.push(E.actualizarInfoUsuario(usuario, { acepta_publicidad: false }));
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
  events = [];
}

async function envioRecursoTest(concurrency) {
  const n = Math.floor(Math.random() * 7000) + 5000;
  for (let j = 0; j < n; j++) {
    const recurso = resources.random();
    const usuario = users.random();
    const exito = Math.random() >= 0.25;
    events.push(E.actualizarEnvio(usuario, recurso, exito))
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
  events = [];
}

async function infoRecursoTest(concurrency) {
  for (let recurso of resources) {
    events.push(E.actualizarInfoRecurso(recurso, { es_visible: false }));
    if (++i % concurrency === 0) {
      await Promise.all(events);
    }
  }
  events = [];
}

async function test(concurrency) {
  console.log('Starting user test in 5 seconds');
  await wait(5000);
  await usersTest(concurrency);
  console.log('Starting resources test in 5 seconds');
  await wait(5000);
  await resourcesTest(concurrency);
  console.log('Starting messaging test in 5 seconds');
  await wait(5000);
  await messageTest(concurrency);
  console.log('Starting sending test in 5 seconds');
  await wait(5000);
  await envioRecursoTest(concurrency);
  console.log('Starting user update test in 5 seconds');
  await wait(5000);
  await infoUsuarioTest(concurrency);
  console.log('Starting resource update test in 5 seconds');
  await wait(5000);
  await infoRecursoTest(concurrency);
  console.log('Deleting all records in 60 seconds.');
}

async function drop(){
  await S.Recurso_obtencion.destroy({ force: true, where: {} });
  await S.Recurso_info.destroy({ force: true, where: {} });
  await S.RecursoCanal_mensajeria.destroy({ force: true, where: {} });
  await S.Recurso.destroy({ force: true, where: {} });
  await S.Usuario_info.destroy({ force: true, where: {} });
  await S.Usuario_solicitud.destroy({ force: true, where: {} });
  await S.UsuarioCanal_mensajeria.destroy({ force: true, where: {} });
  await S.Usuario_donacion.destroy({ force: true, where: {} });
  await S.Historial.destroy({ force: true, where: {} });
  await S.Cuenta.destroy({ force: true, where: {} });
  await S.Evento.destroy({ force: true, where: {} });
}


sequelize.sync({ force: false })
  .then(() => test(50))

  .catch(e => console.log(e));