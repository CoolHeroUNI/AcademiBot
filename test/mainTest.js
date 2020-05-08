const { wait } = require("../util");
const recursos = require('./genRecursos');
const usuarios = require('./genUsuarios');
const mensajes = require('./genMessage');

const E = require('../Schema/Events');
const F = require('../Schema/Events/FasterOperations');
const S = require('../Schema');
const sequelize = require('../database');


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
async function customTest() {
  const usuarios = require('./transicion_Usuario_AcademiBot');
  while (usuarios.length) {
    await Promise.all(usuarios.splice(0, 50).map(async usuario => {
      try {
        const id = usuario["FacebookId"].toString();
        const u = await F.findUsuario('FACEBOOK', id);
        const info = u.get('info');
        if (info.get('especialidad_id')) {
          let ruta = 'FIIS/';
          if (info.get('curso_id')) {
            ruta += info.get('curso_id') + '/';
          }
          await E.actualizarInfoUsuario(u, { ruta });
        }
      } catch (e) {
        console.error(e);
      }
    }))
  }
}

async function customTest3() {
  const usuarios = require('./transicion_Usuario_AcademiBot');
  const transacts = require('./transicion_Transaccion');
  const Face = await S.Canal_mensajeria.findByPk('FACEBOOK');
  const Facebook = require('../util/classes/Facebook');
  const { fbConfig } = require('../config');
  const fb = new Facebook(fbConfig.token, fbConfig.version);
  while (usuarios.length) {
    await Promise.all(usuarios.splice(0, 50).map(async usuario => {
      try {
        const id = usuario["FacebookId"].toString();
        const publicInfo = await fb.getUserInfo(id);
        const { usuario: usuari} = await E.creaUsuario(Face, id, publicInfo);
        await E.actualizarInfoUsuario(usuari, {
          ciclo_id: usuario['Ciclo'] || null,
          especialidad_id: usuario['Especialidad'] ? usuario['Especialidad'].toUpperCase() : null,
          curso_id: usuario['Curso']
        });
        await wait(50);
      } catch (e) {
        console.log(e);
      }
    }))
  }
  while(transacts.length) {
    await Promise.all(transacts.splice(0 ,50).map(async t => {
      try {
        const u = await F.findUsuario('FACEBOOK', t["Usuario"].toString());
        const r = await F.findRecurso('FACEBOOK', t["KeyObtenida"]);
        const exito = t["Exitosa"];
        await E.actualizarEnvio(u, r, exito);
      } catch (e) {
        console.error(e);
      }
    }))
  }
  console.log('Done!')
}

async function customTest2() {
  const usuarios = require('./academibot_Usuario_AcademiBot.json');
  const face = await S.Canal_mensajeria.findByPk('FACEBOOK');
  const Facebook = require('../util/classes/Facebook');
  const { fbConfig } = require('../config');
  const fb = new Facebook(fbConfig.token, fbConfig.version);
  for (let usuario of usuarios) {
    const id = usuario['FacebookId'];
    const usuari = await F.findUsuario('FACEBOOK', id);
    await E.actualizarInfoUsuario(usuari, {
      ciclo_id: usuario['Ciclo'] || null,
      especialidad_id: usuario['Especialidad'] ? usuario['Especialidad'].toUpperCase() : null,
      curso_id: usuario['Curso']
    });
    await wait(50);
  }

  console.log('Done!');
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
    .then(customTest)
    .catch(e => console.log(e));