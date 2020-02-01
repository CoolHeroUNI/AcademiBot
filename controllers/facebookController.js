const nombreCanal = "FACEBOOK";
const { awsCredentials, s3Config, fbConfig, dialogflowConfig, academibotConfig, ownUrl } = require("../config");

const S3 = require("../util/classes/S3");
const Facebook = require("../util/classes/Facebook");
const Dialogflow = require("../util/classes/Dialogflow");

const S = require("../Schema");
const E = require("../Schema/Events");
const { wait, creaTicket } = require("../util");
const {
  findUsuario,
  findCanal_mensajeria,
  findRecurso,
  findRecursos
} = require("../Schema/Events/FasterOperations");
const { detectaCursos, detectaCarpetas, detectaArchivos } = require("../util/databaseOperations");
const { mediaFolder, bienvenida, usersFolder } = academibotConfig;
const s3 = new S3(awsCredentials.accessKeyId, awsCredentials.secretAccessKey, s3Config.region, s3Config.bucket, s3Config.cache);
const fb = new Facebook(fbConfig.token, fbConfig.version);
const dialogflow = new Dialogflow(dialogflowConfig.project, dialogflowConfig.lang);

async function nuevoUsuario(usuario) {
  const usuario_id = usuario.get('canal').get('codigo');
  const ruta_recurso_bienvenida = mediaFolder + "/welcome";
  const recurso = await findRecurso(nombreCanal, ruta_recurso_bienvenida);
  const recurso_canal = recurso.get('canal_mensajeria');
  const enviable = {
    url: '',
    attachment_id: recurso_canal.get('codigo_reutilizacion'),
    type: recurso_canal.get('tipo_archivo')
  };
  await fb.sendText(usuario_id, bienvenida, false);
  await wait(250);
  return fb.sendAttachment(usuario_id, enviable)
    .then(() => E.actualizarEnvio(usuario, recurso, true))
    .catch(e => {
      console.error(e);
      return E.actualizarEnvio(usuario, recurso, false)
    })
}

async function empiezaInteraccion(codigo) {
  codigo = codigo.toString();
  await fb.startInteraction(codigo);
  const canal = await findCanal_mensajeria(nombreCanal);
  let usuario = await findUsuario(nombreCanal, codigo);
  await fb.typingOn(codigo);
  if (!usuario) {
    const infoPublica = await fb.getUserInfo(codigo);
    const e = await E.creaUsuario(canal, codigo, infoPublica);
    usuario = e.usuario;
    if (e.evento.get('error')) throw new Error(e.evento.get('error'));
  }
  return usuario;
}

async function enviaListaCursos(user, cursos) {
  const id = user.get('canal').get('codigo');
  const enviables = cursos.map(curso => curso.enviable());
  return fb.sendOptionsMenu(id, enviables);
}

async function enviaListaCarpetas(user, carpetas) {
  const id = user.get('canal').get('codigo');
  const info = user.get('info');
  let respuesta = (await S.Parametros.findByPk('PETICION-CARPETAS')).get('value').random();
  respuesta = respuesta.replace('***', info.get('curso_id'));
  const enviables = carpetas.map(carpeta => {
    carpeta = carpeta.substr(0, carpeta.length - 1);
    return {
      'title' : carpeta.replace(/-/g,' '),
      'payload' : `SetCarpeta:${carpeta}`
    }
  });
  return fb.sendReplyButtons(id, respuesta, enviables);
}

async function enviaListaRecursos(user, resources) {
  const id = user.get('canal').get('codigo');
  const info = user.get('info');
  let carpeta = info.get('ruta');
  carpeta = carpeta.substr(0, carpeta.length - 1);
  carpeta = carpeta.substr(carpeta.lastIndexOf('/') + 1);
  let respuesta = (await S.Parametros.findByPk('PETICION-RECURSOS')).get('value').random();
  respuesta = respuesta.replace('***', carpeta);
  const enviables = Array.from(new Set(resources.map(r => r.get('info').getShortName())))
    .map(short => {
      return {
        'title' : short,
        'payload' : `SetArchivo:${short}`
      }
    });
  return fb.sendReplyButtons(id, respuesta, enviables);
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
      'url': r.get('info').get('url')
    };
  });
  const resultados = await fb.sendSecuentialAttachments(id, enviables);
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
  return dialogflow.processText(userId, message)
    .then(intent => {
      const { text, payload } = intent;
      const payloadKeys = Object.getOwnPropertyNames(payload);
      if (payloadKeys.length > 0) return procesarPayloadFromNLP(user, intent);
      return fb.sendTextWithURLs(userId, text, false)
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
      if (!info.puede_pedir_cursos()) return regularizaUsuario(user);
      return enviaListaCursos(user, await detectaCursos(user, ''));
    case 'SetFacultad':
      const message = (await S.Parametros.findByPk('PETICION-ESPECIALIDAD')).get('value').random();
      const facultad_id = parameters['facultad'] || parameters;
      const enviables = (await S.Especialidad.findAll({ where: { facultad_id }})).map(e => e.enviable());
      await fb.sendText(userId, message);
      await E.actualizarInfoUsuario(user, { ruta: facultad_id + '/' });
      return fb.sendOptionsMenu(userId, enviables);
    case 'SetEspecialidad':
      const especialidad_id = parameters['especialidad'] || parameters;
      await E.actualizarInfoUsuario(user, { especialidad_id });
      return regularizaUsuario(user);
    case 'SetCiclo':
      if (!info.get('especialidad_id')) return regularizaUsuario(user);
      const ciclo_id = parseInt(parameters['ciclo'] || parameters);
      await E.actualizarInfoUsuario(user, { ciclo_id });
      return enviaListaCursos(user, await detectaCursos(user, ''));
    case 'SetCurso':
      const curso_id = parameters['curso'] || parameters;
      await E.actualizarInfoUsuario(user, { curso_id });
      return enviaListaCarpetas(user, await detectaCarpetas(user));
    case 'SetCarpeta':
      const folder = parameters['carpeta'] || parameters;
      // las carpetas ya incluyen un / al final.
      await E.actualizarInfoUsuario(user, { ruta: info.get('ruta') + folder });
      return enviaListaArchivosDisponibles(user);
    case 'SetArchivo':
      const shortName = parameters['archivo'] || parameters;
      const recursos = await detectaArchivos(user, shortName);
      return enviaRecursos(user, recursos);
    default:
      throw new Error('Commando no valido, ' + command);
  }
}

async function executePetition(user, petition, text) {
  const userId = user.get('canal').get('codigo');
  switch (petition) {
    case 'Meme':
      let memes = (await findRecursos(nombreCanal, mediaFolder + '/memes')).slice(0, 1 + Math.floor(Math.random() * 2));
      await fb.sendText(userId, text);
      return enviaRecursos(user, memes, false);
    default:
      throw new Error("Petición no valida " + petition);
  }
}

async function regularizaUsuario(user) {
  const info = user.get('info');
  if (!info.get('especialidad_id')) {
    const message = (await S.Parametros.findByPk('PETICION-FACULTAD')).get('value').random();
    const enviables = (await S.Facultad.findAll()).map(facultad => facultad.enviable());
    await fb.sendText(user, message);
    return fb.sendOptionsMenu(user, enviables);
  } else if (!info.get('ciclo_id')) {
    const message = (await S.Parametros.findByPk('PETICION-CICLO')).get('value').random();
    const enviables = (await S.Ciclo.findAll()).map(ciclo => ciclo.enviable());
    return fb.sendReplyButtons(user, message, enviables);
  }
}

async function recibePayload(user, payload) {
  const [command, arguments, extra] = payload.split(':');
  if (extra) return Promise.reject(new Error('Comando invalido'));
  return executeCommand(user, command, arguments);
}

async function recibeDonacion(atributos, user) {
  const { evento } = await E.creaRecursos(atributos, user);
  const { uid, buffer } = await creaTicket(evento, user);
  const enviable = {
    url: ownUrl + 'public/images/'+uid+'.png',
    attachment_id: null,
    type: 'image'
  };
  const key = usersFolder + '/' + user.get('id') + '/tickets/' + uid + '.png';
  await s3.putObject(key, { Body: buffer, ContentType: 'image/png' });
  return fb.sendAttachment(user.get('canal').get('codigo'), enviable);
}

module.exports = { recibeMensaje, recibePayload, empiezaInteraccion, recibeDonacion };