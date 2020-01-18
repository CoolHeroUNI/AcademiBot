const nombreCanal = "FACEBOOK";

const media_folder = process.env.ACADEMIBOT_MEDIA_FOLDER;
const mensaje_bienvenida = process.env.ACADEMIBOT_GREETINGS;
const ABURL = process.env.ACADEMIBOT_URL;
const usersFolder = process.env.ACADEMIBOT_USERS_FOLDER;

const { FB, Dialogflow, S3 } = require("../lib/classes/instances");
const { Parametros, Facultad, Ciclo, Especialidad } = require("../Schema");
const E = require("../Events");
const { wait, creaTicket } = require("../lib");
const {
  findUsuario,
  findCanal_mensajeria,
  findRecurso,
  findRecursos
} = require("../Events/FasterOperations");
const { detectaCursos, detectaCarpetas, detectaArchivos } = require("../lib/databaseOperations");

async function nuevoUsuario(usuario) {
  const usuario_id = usuario.get('canal').get('codigo');
  const ruta_recurso_bienvenida = media_folder + "/welcome";
  const recurso = await findRecurso(nombreCanal, ruta_recurso_bienvenida);
  const recurso_canal = recurso.get('canal_mensajeria');
  const enviable = {
    url: '',
    attachment_id: recurso_canal.get('codigo_reutilizacion'),
    type: recurso_canal.get('tipo_archivo')
  };
  await FB.sendText(usuario_id, mensaje_bienvenida, false);
  await wait(250);
  return FB.sendAttachment(usuario_id, enviable)
    .then(() => E.actualizarEnvio(usuario, recurso, true))
    .catch(e => {
      console.error(e);
      return E.actualizarEnvio(usuario, recurso, false)
    })
}

async function empiezaInteraccion(codigo) {
  codigo = codigo.toString();
  await FB.markSeen(codigo);
  const canal = await findCanal_mensajeria(nombreCanal);
  let usuario = await findUsuario(nombreCanal, codigo);
  await FB.typingOn(codigo);
  if (!usuario) {
    const infoPublica = await FB.getUserInfo(codigo);
    const e = await E.creaUsuario(canal, codigo, infoPublica);
    usuario = e.usuario;
    if (e.evento.get('error')) throw new Error(e.evento.get('error'));
  }
  return usuario;
}

async function enviaListaCursos(user, cursos) {
  const id = user.get('canal').get('codigo');
  const enviables = cursos.map(curso => curso.enviable());
  return FB.sendOptionsMenu(id, enviables);
}

async function enviaListaCarpetas(user, carpetas) {
  const id = user.get('canal').get('codigo');
  const info = user.get('info');
  let respuesta = (await Parametros.findByPk('PETICION-CARPETAS')).get('value').random();
  respuesta = respuesta.replace('***', info.get('curso_id'));
  const enviables = carpetas.map(carpeta => {
    carpeta = carpeta.substr(0, carpeta.length - 1);
    return {
      'title' : carpeta.replace(/-/g,' '),
      'payload' : `SetCarpeta:${carpeta}`
    }
  });
  return FB.sendReplyButtons(id, respuesta, enviables);
}

async function enviaListaRecursos(user, resources) {
  const id = user.get('canal').get('codigo');
  const info = user.get('info');
  let carpeta = info.get('ruta');
  carpeta = carpeta.substr(0, carpeta.length - 1);
  carpeta = carpeta.substr(carpeta.lastIndexOf('/') + 1);
  let respuesta = (await Parametros.findByPk('PETICION-RECURSOS')).get('value').random();
  respuesta = respuesta.replace('***', carpeta);
  const enviables = Array.from(new Set(resources.map(r => r.get('info').getShortName())))
    .map(short => {
      return {
        'title' : short,
        'payload' : `SetArchivo:${short}`
      }
    });
  return FB.sendReplyButtons(id, respuesta, enviables);
}

async function enviaRecursos(user, resources, academicos = true) {
  const id = user.get('canal').get('codigo');
  if (academicos) {
    resources = resources.sort((r1, r2) => {
      const p1 = r1.get('info').getPage();
      if (!p1) throw new Error('No se pudo encontrar número de página, archivo: ' + r1.get('info').get('ruta'));
      const p2 = r2.get('info').getPage();
      if (!p2) throw new Error('No se pudo encontrar número de página, archivo: ' + r2.get('info').get('ruta'));
      return p1 - p2;
    });
  }
  const enviables = resources.map(r => {
    const rCanal = r.get('canal_mensajeria');
    return {
      'type': rCanal.get('tipo_archivo'),
      'attachment_id': rCanal.get('codigo_reutilizacion'),
      'url': null
    };
  });
  const resultados = await FB.sendSecuentialAttachments(id, enviables);
  let exito = true;
  for (let i = 0; i < resultados.length; i++) {
    const resultado = resultados[i];
    if (resultado instanceof Error) E.actualizarEnvio(user, resources[i], false);
    else {
      E.actualizarEnvio(user, resources[i], true);
      exito = false;
    }
  }
  if (!exito) return Promise.reject(new Error("Envio fallido"));
}

async function enviaListaArchivosDisponibles(user) {
  const recursos = await detectaArchivos(user, '');
  return enviaListaRecursos(user, recursos);
}

async function recibeMensaje (user, message) {
  const mensajeria = user.get('canal');
  await E.mensajeTexto(user, message);
  if (!mensajeria.get('valido')) return Promise.reject(new Error('Usuario no valido.'));
  const info = user.get('info');
  let userRequestedOnlyOneFolder = false;
  let userRequestedOnlyOneCourse = false;

  const courses = await detectaCursos(user, message);
  if (courses.length === 1) {
    await E.actualizarInfoUsuario(user, { curso_id: courses[0].get('id') });
    userRequestedOnlyOneCourse = true;
  } else if (courses.length > 1) return enviaListaCursos(user, courses);

  const folders = await detectaCarpetas(user, message);
  if (folders.length === 1) {
    await E.actualizarInfoUsuario(user, { ruta: info.get('ruta') + folders[0] });
    userRequestedOnlyOneFolder = true;
  } else if (folders.length > 1) return enviaListaCarpetas(user, folders);

  const files = await detectaArchivos(user, message);
  if (files.length > 0) return enviaRecursos(user, files);

  if (userRequestedOnlyOneFolder) {
    return enviaListaArchivosDisponibles(user);
  } else if (userRequestedOnlyOneCourse) {
    const folders = await detectaCarpetas(user, '');
    return enviaListaCarpetas(user, folders);
  }


  const userId = user.get('canal').get('codigo');
  return Dialogflow.processText(userId, message)
    .then(intent => {
      const { text, payload } = intent;
      const payloadKeys = Object.getOwnPropertyNames(payload);
      if (payloadKeys.length > 0) return procesarPayloadFromNLP(user, intent);
      return FB.sendTextWithURLs(userId, text, false)
    })
    .catch(e => console.error(e));
}

async function procesarPayloadFromNLP(user, Payload) {
  const { payload, parameters } = Payload;
  if (payload['comando']) {
    // Commands come with parameters that must be procesed
    const command = payload['comando'];
    return executeCommand(user, command, parameters);
  } else if (payload['peticion']) {
    // Petitions have no parameters
    const petition = payload['peticion'];
    return executePetition(user, petition, text);
  }
  const e = new Error("No method provided to process Payload: "+JSON.stringify(payload));
}

async function executeCommand(user, command, parameters) {
  const info = user.get('info');
  const userId = user.get('canal').get('codigo');
  switch (command) {
    case 'Empezar':
      await E.actualizarInfoUsuario(user, { especialidad_id: null });
      await nuevoUsuario(user);
      return regularizaUsuario(user);
    case 'ResetEspecialidad':
      await E.actualizarInfoUsuario(user, { especialidad_id: null });
      return regularizaUsuario(user);
    case 'ResetCiclo':
      await E.actualizarInfoUsuario(user, { ciclo_id: null });
      return regularizaUsuario(user);
    case 'Cursos':
      if (!user.puede_pedir_cursos()) return regularizaUsuario(user);
      return enviaListaCursos(user, await detectaCursos(user, ''));
    case 'SetFacultad':
      const message = (await Parametros.findByPk('PETICION-ESPECIALIDAD')).get('value').random();
      const facultad_id = parameters['facultad'] || parameters;
      const enviables = (await Especialidad.findAll({ where: { facultad_id }})).map(e => e.enviable());
      await FB.sendText(userId, message);
      return FB.sendOptionsMenu(userId, enviables);
    case 'SetEspecialidad':
      const especialidad_id = parameters['especialidad'] || parameters;
      await E.actualizarInfoUsuario(user, { especialidad_id });
      return regularizaUsuario(user);
    case 'SetCiclo':
      if (!info.get('especialidad_id')) return regularizaUsuario(user);
      const ciclo_id = parseInt(parameters['ciclo'] || parameters);
      await E.actualizarInfoUsuario(user, { ciclo_id });
      return enviaListaCursos(user, detectaCursos(user, ''));
    case 'SetCurso':
      const curso_id = parameters['curso'] || parameters;
      await E.actualizarInfoUsuario(user, { curso_id });
      return enviaListaCarpetas(user, detectaCarpetas(user, ''));
    case 'SetCarpeta':
      const folder = parameters['carpeta'] || parameters;
      await E.actualizarInfoUsuario(user, { ruta: info.get('ruta') + folder });
      return enviaListaArchivosDisponibles(user);
    case 'SetArchivo':
      const shortName = parameters['archivo'] || parameters;
      const recursos = detectaArchivos(user, shortName);
      return enviaRecursos(user, recursos);
    default:
      throw new Error('Commando no valido, ' + command);
  }
}

async function executePetition(user, petition, text) {
  const userId = user.get('canal').get('codigo');
  switch (petition) {
    case 'Meme':
      let memes = (await findRecursos(nombreCanal, media_folder + '/memes')).slice(0, 1 + Math.floor(Math.random() * 2));
      await FB.sendText(userId, text);
      return enviaRecursos(user, memes, false);
    default:
      throw new Error("Petición no valida " + petition);
  }
}

async function regularizaUsuario(user) {
  const info = user.get('info');
  if (!info.get('especialidad_id')) {
    const message = (await Parametros.findByPk('PETICION-FACULTAD')).get('value').random();
    const enviables = (await Facultad.findAll()).map(facultad => facultad.enviable());
    await FB.sendText(user, message);
    return FB.sendOptionsMenu(user, enviables);
  } else if (!info.get('ciclo_id')) {
    const message = (await Parametros.findByPk('PETICION-CICLO')).get('value').random();
    const enviables = (await Ciclo.findAll()).map(ciclo => ciclo.enviable());
    return FB.sendReplyButtons(user, message, enviables);
  }
}

async function recibePayload(user, payload) {
  const [command, arguments, extra] = payload.split(':');
  if (extra) return Promise.reject(new Error('Comando invalido'));
  return executeCommand(user, command, arguments);
}

async function recibeDonacion(atributos, user) {
  const { evento } = await E.creaRecursos(atributos, user);
  const { dir, buffer } = await creaTicket(evento, user);
  const enviable = {
    url: ABURL + dir,
    attachment_id: null,
    type: 'image'
  };
  console.log(enviable);
  const key = usersFolder + '/' + user.get('id') + '/tickets/' + dir;
  await S3.putObject(key, { Body: buffer, ContentType: 'image/png' });
  return FB.sendAttachment(user.get('canal').get('codigo'), enviable);
}

module.exports = { recibeMensaje, recibePayload, empiezaInteraccion, recibeDonacion };