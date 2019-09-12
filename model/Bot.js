const fs = require('fs');
const RequestPromise = require('request-promise');
const linkify = require('linkifyjs');
const archiver = require('archiver');
const stream = require('stream');

const Amazon = require('./servicios-web/Amazon');
const Facebook = require('./servicios-web/Facebook');
const DialogFlow = require('./servicios-web/DialogFlow');

const Universidad = require('./universidad/Universidad');
const Archivador = require('./universidad/archivos/Archivador');
const Archivo = require('./universidad/archivos/Archivo');
const Usuario = require('./universidad/facultad/Usuario');
const Peticion = require('./universidad/facultad/Peticion');
const Especialidad = require('./universidad/facultad/Especialidad');
const Facultad = require('./universidad/facultad/Facultad');

/**
 * Clase que representa el funcionamiento del ChatBot,
 * interactua con AWS y Facebook por medio de sus modulos
 * propios, esta clase debe ser considerada como una 
 * interfaz para simplificar el llamado de metodos entre
 * los modulos.
 * @class Bot
 */
class Bot {
  /**
   * @constructor
   * @param {{accessKeyId:String, secretAccessKey:String, region:String, nombre:String}} amazonConfig
   * datos para la creacion de un bucket de S3
   * @param {String} facebookToken token para poder interactuar con la
   * graph API de Facebook
   * @param {String} [DialogFlowProjectId] id del proyecto de dialogflow, es opcional
   */
  constructor (amazonConfig, facebookToken, DialogFlowProjectId) {
    const accessKeyId = amazonConfig.accessKeyId;
    const secretAccessKey = amazonConfig.secretAccessKey;
    const region = amazonConfig.region;
    const nombre = amazonConfig.nombre;
    let dialogflow = this.setupDialogFlow(DialogFlowProjectId);
    /**
     * Propiedad para interactuar con la Universidad
     * @property {Universidad} UNI
     */
    this.UNI = new Universidad();
    /**
     * Propiedad para guardar los archivos y leerlos de 
     * forma eficiente
     * @property {Archivador} archivos
     */
    this.archivos = new Archivador();
    /**
     * Propiedad para interactuar con s3
     * @property {Amazon} amazon
     */
    this.amazon = new Amazon(accessKeyId, secretAccessKey, region, nombre);
    /**
     * Propiedad para interactuar con facebook
     * @property {Facebook} FB
     */
    this.FB = new Facebook(facebookToken);
    /**
     * Propiedad para interactuar con DialogFlow
     * @property {DialogFlow} dialogflow
     */
    this.dialogflow = dialogflow;
    /**
     * Propiedad para almacenar los envios de parte de los usuarios
     * @property {Archivador} submissions
     */
    this.submissions = new Archivador();
    /**
     * Propiedad para almacenar los memes para enviar a los usuarios
     * @property {Archivador} memes
     */
    this.memes = new Archivador();
  }
}

/**
 * Metodo para configurar las variables de entorno para DialogFlow
 * se carga el archivo de claves a partir de la variable DIALOGFLOW
 * y se escribe en la ubicacion indicada por GOOGLE_APPLICATION_CREDENTIALS
 * @method setupDialogFlow
 * @param {String} projectId id del proyecto de
 */
Bot.prototype.setupDialogFlow = function (projectId) {
  if (projectId === "DONT USE") return null;
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let DialogFlowString = process.env.DIALOGFLOW;
  fs.writeFileSync(path, DialogFlowString);
  // noinspection JSUnresolvedVariable
  const id = projectId || JSON.parse(DialogFlowString).project_id;
  return new DialogFlow(id);
};
/**
 * Metodo para cargar los datos de la Universidad
 * @method cargaUniversidad
 * @param {{id:String,especialidades:{id:String,malla:Object[]}[],directorio:Object,cursos:{codigo:String,nombre:String}[]}[]} facultades
 * @param {{id:String,especialidad:String,ciclo:String,historial:String[],cantidadHistorica:Number,peticionActual:{curso:{codigo:String,nombre:String},carpeta:String}}[]} usuarios
 */
Bot.prototype.cargaUniversidad = function (facultades, usuarios) {
  this.UNI.cargaFacultades(facultades);
  this.UNI.cargaUsuarios(usuarios);
};
/**
 * Metodo para cargar los datos del archivador
 * @method cargaArchivador
 * @param {[String,{attachment_id:String,contador:Number}][]} archivador
 */
Bot.prototype.cargaArchivador = function (archivador) {
  this.archivos.cargaArchivos(archivador);
};
/**
 * Metodo para crear un nuevo usuario
 * @method creaUsuario
 * @param {String} id
 * @returns {Usuario}
 */
Bot.prototype.creaUsuario = function (id) {
  const imagen = new Archivo("configuracion/bienvenida.jpg");
  const imagenesBienvenida = this.amazon.firmaUrls([imagen]);
  const mensajeBienvenida = 
  "Hola, no te habia visto por aqui antes, soy AcademiBot," +
  " me encargo de mantener una base de datos de material académico" +
  " en constante crecimiento, espero poder ser de utilidad, te enviaré" + 
  " un manual para que puedas utilizar mis servicios adecuadamente.";
  this.FB.enviaTexto(id, mensajeBienvenida)
    .then(() => this.FB.enviaAdjunto(id, imagenesBienvenida[0].payload, "image"))
    .catch(e => console.log({error: e['message'], codigo: e['code']}));
  const usuario = this.UNI.creaUsuario(id);
  this.FB.getUserInfo(id)
    .then(info => {
      info = JSON.parse(info)
      usuario.setNombre(info.name)
    })
    .catch(e => console.log({error: e['message'], codigo: e['code']}));
  return usuario;
};
/**
 * Metodo para verificar si el usuario existia en la base de datos.
 * @method haveUsuario
 * @param {String} id
 * @returns {Boolean}
 */
Bot.prototype.haveUsuario = function (id) {
  let usuario = this.UNI.getUsuario(id);
  return !!usuario;
};
/**
 * Homologo del metodo para obtener usuarios en universidad, cuando el proyecto crezca 
 * se tendra que usar una estructura de acceso aleatorio para las distintas universidades
 * Si no se encuentra el usuario en la universidad, se crea y devuelve una referencia a este
 * @method getUsuario
 * @param {String} id
 * @returns {Usuario}
 */
Bot.prototype.getUsuario = function (id) {
  let usuario = this.UNI.getUsuario(id);
  usuario = usuario ? usuario : this.creaUsuario(id);
  return usuario;
};
/**
 * Metodo para enviar memes en la carpeta, se necesita un rango dinamico para poder enviar, se empieza
 * por defecto en 0,
 * @method enviaMeme
 * @param {Usuario} usuario
 */
Bot.prototype.enviaMeme = function (usuario) {
  const meme = this.memes.toArray().random();
  const urlFirmada = this.amazon.firmaUrls([meme]);
  this.FB.enviaAdjuntos(usuario.id, urlFirmada)
    .catch(e => console.log({error: e['message'], codigo: e['code']}));
};
/**
 * Metodo para obtener una lista de cursos, y enviarla a un usuario si tiene una
 * especialidad y si tiene un ciclo seleccionado.
 * @method enviaCursos
 * @param {Usuario} usuario
 */
Bot.prototype.enviaCursos = function (usuario) {
  let nombreEspecialidad = usuario.getEspecialidad();
  let id = usuario.id;
  if (!nombreEspecialidad) return this.reaccionaSinEspecialidad(usuario);
  let especialidad = this.UNI.getEspecialidad(nombreEspecialidad);
  let ciclo = usuario.getCiclo();
  if (!ciclo) {
    this.reaccionaSinCiclo(usuario);
    return ;
  }
  const cursos = especialidad.getCursosDeCiclo(ciclo).map(curso => {
    return {
      title : curso.nombre.replace(/-/g, ' '),
      botones : [
        "Material " + curso.codigo,
        "SetPeticion Curso " + curso.codigo
      ]
    }
  });
  console.log(cursos);
  if (cursos.length === 0) {
    this.FB.enviaTexto(id, "No dispongo de cursos para este ciclo.")
       .catch(e => console.log({error: e['message'], codigo: e['code']}));
    return ;
  }
  let parametros = Facebook.parametrizaCarrusel(Array.shuffle(cursos));
  this.FB.enviaCarrusel(id, parametros)
     .catch(e => console.log({error: e['message'], codigo: e['code']}));
};
/**
 * Metodo para parsear un mensaje de un usuario y comprobar si es una peticion, devuelve 
 * un objeto con las propiedades de esta peticion
 * @method parseMensaje
 * @param {Usuario} usuario
 * @param {String} mensaje
 * @returns {Object} si el mensaje era peticion
 */
Bot.prototype.parseMensaje = function (usuario, mensaje) {
  let especs = usuario.getEspecialidad();
  // if (!especs) return false;
  let especialidad = this.UNI.getEspecialidad(especs);
  return especialidad.parse(mensaje, usuario.peticionActual);
};
/**
 * Metodo para asignar una especialidad a un usuario
 * @method setEspecialidad
 * @param {Usuario} usuario
 * @param {String} id identificador de la especialidad
 */
Bot.prototype.setEspecialidad = function (usuario, id) {
  let lista = this.UNI.getEspecialidadesId();
  if (lista.includes(id)) {
    usuario.setEspecialidad(id);
  } else {
    const mensajeDenegacion = "Especialidad NO valida";
    this.FB.enviaTexto(usuario.id, mensajeDenegacion)
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
  }
};
/**
 * Metodo para guardar el estado actual de las facultades de UNI
 * @method guardaFacultades
 */
Bot.prototype.guardaFacultades = function () {
  let key = "configuracion/facultades.json";
  let facultades = this.UNI.getFacultadesObject().map(facultad => facultad.toJSON());
  this.amazon.putObject(key, JSON.stringify(facultades));
};
/**
 * Metodo para leer el archivo que contiene el estado actual de
 * las facultades de UNI
 * @method leeFacultades
 * @returns {Promise}
 */
Bot.prototype.leeFacultades = function () {
  let key = "configuracion/facultades.json";
  return this.amazon.getJSON(key);
};
/**
 * Metodo para guardar el estado actual de los Usuarios
 * @method guardaUsuarios
 */
Bot.prototype.guardaUsuarios = async function () {
  const key = "configuracion/usuarios.json";
  const usuarios = this.UNI.getUsuarios().map(usuario => usuario.toJSON());
  const ultimoSalvado = await this.leeUsuarios();
  if (ultimoSalvado.length > usuarios.length) {
    console.log("Ejecutando union de usuarios.");
    this.FB.enviaTexto("2605137522848909", "REINICIO IRREGULAR!")
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
    // añade a tods los usuarios que estan en el ultimo salvado y que no estan en el nuevo
    for (let usuario of ultimoSalvado) {
      if (!usuarios.find((_usuario) => _usuario.id === usuario.id)) {
        usuarios.push(usuario);
      }
    }
  }
  this.amazon.putObject(key, JSON.stringify(usuarios));
};
/**
 * Metodo para leer el archivo que contiene el estado actual de los usuarios de UNI y los 
 * devuelve en forma de un Objeto
 * @method leeUsuarios
 * @returns {Promise<{id:String,especialidad:String,ciclo:String,historial:String[],cantidadHistorica:number,peticionActual:Object}[]>}
 */
Bot.prototype.leeUsuarios = function () {
  let key = "configuracion/usuarios.json";
  return this.amazon.getJSON(key);
};
/**
 * Metodo para guardar el estado actual del archivador
 * @method guardaArchivador
 */
Bot.prototype.guardaArchivador = function () {
  let key = "configuracion/archivador.json";
  let archivos = this.archivos.toJSON();
  this.amazon.putObject(key, JSON.stringify(archivos));
};
/**
 * Metodo para leer el archivo que contiene el estado actual del archivador y los devuelve como objeto
 * @method leeArchivador
 * @returns {Promise}
 */
Bot.prototype.leeArchivador = function () {
  let key = "configuracion/archivador.json";
  return this.amazon.getJSON(key);
};
/**
 * Metodo para cargar las direcciones de los archivos enviados por los usuarios
 * @method cargaSubmissions
 * @returns {Promise<void>}
 */
Bot.prototype.cargaSubmissions = async function () {
  let direcciones = await this.amazon.listaObjetos('submissions');
  for (let i = 0; i < direcciones.length; i++) {
    this.submissions.creaArchivo(direcciones[i]);
  }
};
/**
 * Metodo para cargar las direcciones de los memes para servir a los usuarios
 * @method cargaMemes
 * @returns {Promise<void>}
 */
Bot.prototype.cargaMemes = async function () {
  let direcciones = await this.amazon.listaObjetos('memes');
  for (let i = 0; i < direcciones.length; i++) {
    this.memes.creaArchivo(direcciones[i]);
  }
};
/**
 * Metodo par actualizar el estado actual de UNI, leyendo los archivos de la carpeta llamada configuracion 
 * "facultades.json","usuarios.json" y "archivador.json", que contienen las configuraciones necesarias
 * @method carga
 */
Bot.prototype.carga = async function () {
  console.log("Iniciando servicio...");
  /* let datos = [this.leeFacultades(), this.leeUsuarios()];
  Promise.all(datos)
    .then(lista => this.cargaUniversidad(lista[0], lista[1])); */
  let facultades = await this.leeFacultades();
  let usuarios = await this.leeUsuarios();
  let archivador = await this.leeArchivador();
  this.cargaSubmissions()
    .catch(e => console.log(e));
  await this.cargaMemes();
  this.cargaUniversidad(facultades, usuarios);
  this.cargaArchivador(archivador);
  console.log("Inicio completado");
};
/**
 * Metodo para guardar el estado actual de el AcademiBot,
 * se ve por conveniente no guardar las facultades, ya que realmente 
 * no se afectan por ahora
 * @method guarda
 */
Bot.prototype.guarda = function () {
  console.log("Intentando guardar...");
  this.guardaUsuarios()
    .then(() => console.log("Guardado exitoso"))
    .catch(e => console.log(e));
  // this.guardaFacultades();
  this.guardaArchivador();
};
/**
 * Metodo para actualizar los directorios de las facultades basado
 * en las subcarpetas de s3
 * @method actualizaDirectorios
 */
Bot.prototype.actualizaDirectorios = async function () {
  let facultades = this.UNI.getFacultadesObject();
  let JSONfacultades = [];
  for (let facultad of facultades) {
    let direcciones = await this.amazon.listaObjetos(facultad.id);
    let directorio = Facultad.creaDirectorio(direcciones);
    let JSONfacultad = facultad.toJSON();
    JSONfacultad.directorio = directorio;
    JSONfacultades.push(JSONfacultad);
  }
  this.UNI.cargaFacultades(JSONfacultades);
  this.guardaFacultades();
};
/**
 * Metodo para obtener la ruta y urlFirmada de un tipo de archivo en submissions
 * @method obtieneArchivoDeEnvios
 * @param {String} tipo
 * @returns {Promise<{ruta:String,url:String,body:Buffer,indice:Number}>}
 */
Bot.prototype.obtieneArchivoDeEnvios = async function (tipo, index) {
  let envio = this.submissions.toArray().filter(archivo => archivo.getType() === tipo);

  return new Promise((resolve, reject) => {
    if (!envio) {
      reject(new Error("No existen envios que cumplan dichas especificaciones"));
    } else {
      if (index >= envio.length) index = envio.length - 1;
      if (index < 0) index = 0;
      envio = envio[index];
      let urlFirmada = this.amazon.firmaUrls([envio], 600)[0];

      this.amazon.getObject(envio.getRuta())
        .then(data => {
          resolve({
            ruta: envio.getRuta(),
            url: urlFirmada.payload.url,
            body: data.Body,
            indice: index
          })
        })
        .catch(e => reject(e));
    }
  });
};
/**
 * Metodo para mover un archivo en S3 dentro del bucket
 * @method mueveArchivo
 * @param {String} origen Key de origen
 * @param {String} destino Key de destino
 * @returns {Promise<void>}
 */
Bot.prototype.mueveArchivo = async function (origen, destino) {
  this.archivos.eliminaArchivo(destino); //Elimina la redundancia del archivo anterior contra una nueva copia
  this.amazon.moveObject(origen, destino)
    .catch(e => console.log(e));
};
/**
 * Metodo para eliminar archivos
 * @method borraArchivo
 * @param {String} key
 * @returns {Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>>}
 */
Bot.prototype.borraArchivo = function (key) {
  return this.amazon.deleteObject(key);
};
/**
 * Metodo para reaccionar ante la situacion en la que el usuario
 * no posee Especialidad.
 * @method reaccionaSinEspecialidad
 * @param {Usuario} usuario
 * @param {String} [mensaje] posible asignacion de especialidad, del
 * tipo "SetEspecialidad xxx"
 */
Bot.prototype.reaccionaSinEspecialidad = function (usuario, mensaje) {
  // Refactor: crear metodo separador para asignar especialidad
  const comandoEspecialidad = "SetEspecialidad ";
  const id = usuario.id;
  let buscaAsignar = new RegExp(comandoEspecialidad).test(mensaje);
  let lista = this.UNI.getEspecialidadesId();
  if (buscaAsignar) {
    let especialidadId = mensaje.substr(comandoEspecialidad.length);
    if (lista.includes(especialidadId)) {
      usuario.setEspecialidad(especialidadId);
      if (!usuario.getCiclo()) this.reaccionaSinCiclo(usuario);
      else this.FB.enviaTexto(id, "Genial, ahora puedes pedir material.")
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
    } else {
      const mensajeDenegacion = "Especialidad NO valida";
      this.FB.enviaTexto(id, mensajeDenegacion)
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
    }
  } else {
    const botones = lista.map((id) => ["text",id, comandoEspecialidad + id]);
    const parametros = Facebook.parametrizaQuickReply(botones);
    const mensajePeticion = "Selecciona una especialidad";
    this.FB.enviaQuickReply(id, parametros, mensajePeticion)
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
  }
};
/**
 * Metodo para reaccionar ante la sitacion donde la peticion hecha es valida
 * @method reaccionaPeticionValida
 * @param {Usuario} usuario
 * @param {Especialidad} especialidad especialidad del usuario
 */
Bot.prototype.reaccionaPeticionValida = function (usuario, especialidad) {
  let facultad = this.UNI.getFacultad(especialidad.id);
  const peticion = usuario.getPeticion();
  let rutas = facultad.getRutas(peticion, especialidad.id);
  let archivos = rutas.map(ruta => this.archivos.getArchivo(ruta));
  let urlsFirmadas = this.amazon.firmaUrls(archivos);
  usuario.completaPeticion();
  let promesa = this.FB.enviaAdjuntos(usuario.id, urlsFirmadas);
  // Revisar esto cuidadosamente, puede que las promesas no se almacenen en el mismo orden en el que llegan
  promesa
    .then(respuestas => {
      if (respuestas.length !== archivos.length) return ;
      for (let i = 0; i < archivos.length; i++) {
        if (respuestas[i].attachment_id) archivos[i].setAttachmentId(respuestas[i].attachment_id);
      }
    })
    .catch(e => console.log({error: e['message'], codigo: e['code']}))
    .finally(() => this.reaccionaPeticionNoValida(usuario, especialidad, "¿Otra?"));
};
/**
 * Metodo para reaccionar ante la situacion donde el usuario no tiene ciclo,
 * a futuro puede encargarse de la asignacion de ciclos
 * @method reaccionaSinCiclo
 * @param {Usuario} usuario
 * @param {String} [mensaje] mensaje enviado por usuario para asignar
 */
Bot.prototype.reaccionaSinCiclo = function (usuario, mensaje) {
  const comandoCiclo = "SetCiclo ";
  let buscaAsignar = new RegExp(comandoCiclo).test(mensaje);
  if (buscaAsignar) {
    let ciclo = mensaje.substr(comandoCiclo.length);
    usuario.setCiclo(ciclo);
    this.FB.enviaTexto(usuario.id, "Genial, ahora puedes pedir algun curso.")
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
    return ;
  }
  let espec = usuario.getEspecialidad();
  let especialidad = this.UNI.getEspecialidad(espec);
  let botones = especialidad.ciclosDisponibles().map((ciclo) => ["text", ciclo, comandoCiclo + ciclo]);
  const parametros = Facebook.parametrizaQuickReply(botones);
  const mensajePeticion = "Elije un Ciclo";
  this.FB.enviaQuickReply(usuario.id, parametros, mensajePeticion)
    .catch(e => console.log({error: e['message'], codigo: e['code']}));
};
/**
 * Metodo para reaccionar ante la situacion donde la peticion no sea
 * valida
 * @method reaccionaPeticionNoValida
 * @param {Usuario} usuario usuario que no tiene peticion valida
 * @param {Especialidad} especialidad especialidad del usuario
 * @param {String} [mensaje] mensaje, si no se especifica se envia por defecto
 */
Bot.prototype.reaccionaPeticionNoValida = function (usuario, especialidad, mensaje) {
  const peticion = usuario.getPeticion();
  let comandoPeticion = "SetPeticion ";
  const comandos = ["Carpeta ", " Archivo "];
  // Si llegando a este punto la peticion no tiene curso ni carpeta no se puede hacer nada
  if (peticion.esVacia()) return ;
  
  let necesario = especialidad.getDeDirectorio(peticion);
  /**
   * @type {String[][]}
   */
  let botones;
  if (necesario.tipo === "carpeta") {
    comandoPeticion += comandos[0];
    mensaje = mensaje ? mensaje : "Selecciona alguna carpeta de " + peticion.getCursoNombre().replace(/-/g,' ');
    botones = necesario.opciones.map((item) => ["text",item.replace(/-/g,' '), comandoPeticion + item]);
  }
  if (necesario.tipo === "archivo") {
    comandoPeticion += comandos[1];
    mensaje = mensaje ? mensaje : "Selecciona algún archivo de " + peticion.getCarpeta().replace(/-/g,' ');
    botones = necesario.opciones.map((item) => ["text",item, comandoPeticion + item]).reverse();
  }
  
  let parametros = Facebook.parametrizaQuickReply(botones);
  this.FB.enviaQuickReply(usuario.id, parametros, mensaje)
    .catch(e => console.log({error: e['message'], codigo: e['code']}));
};
/**
 * Metodo para procesar un comando que busca actualizar una peticion o solicitar 
 * archivos, devuelve si la peticion cambio o no
 * @method procesaPeticion
 * @param {Usuario} usuario
 * @param {String} peticionMensaje
 * @returns {Boolean} si la peticion realmente cambió
 */
Bot.prototype.procesaPeticion = function (usuario, peticionMensaje) {
  const comandos = ["Curso ", "Carpeta ", "Archivo "];
  const expresiones = comandos.map(comando => new RegExp(comando));
  const especialidad = this.UNI.getEspecialidad(usuario.getEspecialidad());
  const peticion = usuario.getPeticion();
  if (expresiones[0].test(peticionMensaje)) {
    // Intencion de actualizar un curso
    const curso = especialidad.comparaCurso(peticionMensaje.substr(comandos[0].length));
    const anteriorCurso = peticion.getCursoNombre();
    peticion.setCurso(curso);
    this.reaccionaPeticionNoValida(usuario, especialidad);
    return (anteriorCurso !== curso.nombre);
  }
  if (expresiones[1].test(peticionMensaje)) {
    // Intencion de actualizar carpeta
    const carpeta = peticionMensaje.substr(comandos[1].length);
    const anteriorCarpeta = peticion.getCarpeta();
    peticion.setCarpeta(carpeta);
    this.reaccionaPeticionNoValida(usuario, especialidad);
    return (anteriorCarpeta !== carpeta);
  }
  if (expresiones[2].test(peticionMensaje)) {
    // Intencion de actualizar archivo
    const curso = peticion.getCursoNombre();
    const carpeta = peticion.getCarpeta();
    const mensaje = peticionMensaje.substr(comandos[2].length);
    const archivo = especialidad.comparaArchivo(curso, carpeta, mensaje);
    const seccion = especialidad.comparaSeccion(true, mensaje);
    peticion.setArchivo(archivo);
    peticion.setSeccion(seccion);
    this.reaccionaPeticionValida(usuario, especialidad);
    return true;
  }
  return false;
};
/**
 * Metodo para procesar una peticion por texto, no incurre en los errores de la anterior
 * al usar expresiones regulares que pueden ser interpretadas de manera equivocada
 * @method procesaPeticionTexto
 * @param {Usuario} usuario
 * @param {String} mensaje
 * @returns {Boolean} si la peticion cambió
 */
Bot.prototype.procesaPeticionTexto = function (usuario, mensaje) {
  const especialidad = this.UNI.getEspecialidad(usuario.getEspecialidad());
  const peticion = usuario.getPeticion();
  const id = usuario.id;
  const JSONpeticion = this.parseMensaje(usuario, mensaje);
  const cambio = Object.getOwnPropertyNames(JSONpeticion).length > 0;
  peticion.cargaDesdeJSON(JSONpeticion);
  if (peticion.esValida()) {
    if (usuario.habilitado) {
      this.reaccionaPeticionValida(usuario, especialidad);
    } else {
      usuario.desBan(15);
      const mensajeDenegacion = "Se te ha impedido el uso de esa función por el momento.";
      this.FB.enviaTexto(id, mensajeDenegacion)
          .catch(e => console.log({error: e['message'], codigo: e['code']}));
    }
  } else if (cambio) {
    this.reaccionaPeticionNoValida(usuario, especialidad);
  }
  return cambio;
};
/**
 * Metodo para determinar si un postback contiene un comando predefinido, ya sea 
 * para actualizar informacion del usuario o para definir una peticion
 * @method procesaComando
 * @param {Usuario} usuario usuario que envia el mensaje
 * @param {String} mensaje mensaje enviado, se comparara para ver si es un comando
 * @return {Boolean}
 */
Bot.prototype.procesaComando = function (usuario, mensaje) {
  const comandoTexto = ["SetPeticion ", "SetCiclo ", "SetEspecialidad ", "Cursos", "Empezar"];
  const comandos = comandoTexto.map(comando => new RegExp(comando,'i'));
  if (comandos[0].test(mensaje)) {
    // Intencion de actualizar la peticion o solicitar un archivo
    //const JSONpeticion = especialidad.parse());
    try {
      this.procesaPeticion(usuario, mensaje.substr(comandoTexto[0].length));
    } catch (error) {
      console.log(error);
      usuario.peticionActual = new Peticion();
      this.FB.enviaTexto(usuario.id, error.toString() + "\nDebido a ese error se ha decidido reinciar tu peticion.")
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
    }
    return true;
  }
  if (comandos[1].test(mensaje)) {
    // Intencion de actualizar el ciclo del usuario
    this.reaccionaSinCiclo(usuario, mensaje);
    this.enviaCursos(usuario);
    return true;
  }
  if (comandos[2].test(mensaje)) {
    // Intencion de actualizar la especialidad del usuario
    let especialidadId = mensaje.substr(comandoTexto[2].length);
    this.setEspecialidad(usuario, especialidadId);
    if (!usuario.getCiclo()) this.reaccionaSinCiclo(usuario);
    else this.FB.enviaTexto(usuario.id, "Genial, pide algo ahora.")
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
    return true;
  }
  if (comandos[3].test(mensaje)) {
    // Intencion de revisar la lista de cursos
    this.enviaCursos(usuario);
    return true;
  }
  // noinspection RedundantIfStatementJS
  if (comandos[4].test(mensaje)) {
    // Explicacion: Al llamar al metodo getUsuario ya se le envia a este un
    // mensaje de bienvenida, por lo que no hay que hacer nada aqui.
    return true;
  }
  return false;
};
/**
 * Metodo para comprimir archivos dentro de las subcarpetasdel Bot
 * @method compressFiles
 */
Bot.prototype.compressFiles = async function () {
  let facultades = this.UNI.getFacultadesObject();
  const LIMITE = 25000000 - 5000000; // Limite de facebook - factor de correccion
  for (let facultad of facultades) {
    let id = facultad.id;
    for (let curso in facultad.directorio) {
      for (let carpeta in facultad.directorio[curso]) {
        let pesoTotal = 0, n = 0;
        let bufs = [];
        if (!facultad.directorio[curso].hasOwnProperty(carpeta)) continue;
        const output = new stream.PassThrough();
        let comprimido = archiver('zip', {
          comment : `${carpeta} de ${curso} de la ${id}.`,
          zlib: {level : 9}
        });
        output.on('close', () => console.log(comprimido.pointer() + " data added."));
        output.on('end', () => {
          let buffer = Buffer.concat(bufs);
          let condicionExistencia = buffer.length > 0 && n > 0 && pesoTotal > 0;
          let condicionLimite = buffer.length < LIMITE && n > 2;
          if (condicionExistencia && condicionLimite) {
            let nueva = carpeta.split('-');
            nueva = nueva[carpeta.length - 1];
            let filename = `${nueva}_todos.zip`;
            let zipKey = `${id}/${curso}/${carpeta}/${filename}`;
            this.amazon.putObject(zipKey, buffer, 'application/zip')
                .then(() => {
                  this.archivos.eliminaArchivo(zipKey); //Evitar redundancia en archivos locales
                  console.log(zipKey + " finalizado")
                })
                .catch(e => console.log(e));
          }
        });
        comprimido.on('error', e => console.log("Error en comprimido"));
        comprimido.pipe(output);
        output.on('data', data => bufs.push(data));
        if (facultad.directorio[curso][carpeta].length > 2) {
          for (let archivo of facultad.directorio[curso][carpeta]) {
            if (pesoTotal*(n+1) > LIMITE*n || comprimido.pointer() > LIMITE) break; // Estimacion de peso adicional de un archivo adicional
            let key = `${id}/${curso}/${carpeta}/${archivo}`;
            let file = this.archivos.getArchivo(key);
            if (file.extension === 'zip' || file.extension === 'rar') continue;
            let data = await this.amazon.getObject(key);
            if (pesoTotal + data.ContentLength < LIMITE) {
              comprimido.append(data.Body, {name : `${id}_${curso}_${carpeta}_${archivo}`});
            }
            n++;
            pesoTotal += data.ContentLength;
          }
        }
        comprimido.finalize();
        /**let zipKey = `${id}/${curso}/${carpeta}/todos.zip`;

        this.amazon.putObject(zipKey, output, 'application/zip', comprimido.pointer())
            .then(() => {
              this.archivos.eliminaArchivo(zipKey); //Evitar redundancia en archivos locales
              console.log(zipKey + " finalizado")
            })
            .catch(e => console.log(e));**/
      }
    }
  }

};
/**
 * Metodo llamado al recibir un postback de parte de un usuario por medio de los
 * botones de facebook, facilita la o
 * @method recibePostback
 * @param {String} id
 * @param {String} mensaje
 */
Bot.prototype.recibePostback = function (id, mensaje) {
  if (!this.haveUsuario(id)) return this.creaUsuario(id);
  const usuario = this.getUsuario(id);
  //let usuario = this.haveUsuario(id) ? this.getUsuario(id) : this.creaUsuario(id);
  // si no existe el usuario lo crea  
  let espec = usuario.getEspecialidad();
  if (!espec) this.reaccionaSinEspecialidad(usuario, mensaje);
  else this.procesaComando(usuario, mensaje);

};
/**
 * Metodo para procesar mensajes de texto por parte de los usuarios,
 * dialogflow emitira una respuesta donde se consideran tres casos, el 
 * caso en que la respuesta sea un comando, donde sea una peticion y
 * donde no suceda ninguna de estas y sea texto plano
 * @method recibeTexto
 * @param {String} id
 * @param {String} texto
 */
Bot.prototype.recibeTexto = async function (id, texto) {
  this.FB.marcaVisto(id);
  if (!this.haveUsuario(id)) return this.creaUsuario(id);
  const usuario = this.getUsuario(id);
  let respuesta = {
    texto: "",
    comando: ""
  };
  try {
    respuesta = await this.dialogflow.procesaIntencion(texto, id);
  } catch (error) {
    console.log(error);
    respuesta.texto = `${error.message}\nPor este motivo, no puedo darte una respuesta fluida.`;
  }
  if (respuesta.comando) {
    const comando = respuesta.comando;
    /**
     * 26-05-19: Habilitados tres comandos: SetEspecialidad, SetCiclo, Cursos
     */
    if (comando === "SetEspecialidad") {
      const especialidadId = respuesta.params.especialidad.stringValue;
      this.setEspecialidad(usuario, especialidadId);
      this.FB.enviaTexto(id, respuesta.texto)
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
    } else if (comando === "SetCiclo") {
      if (!usuario.getEspecialidad()) return this.reaccionaSinEspecialidad(usuario);
      const ciclo = respuesta.params.ciclo.stringValue;
      const ciclos = this.UNI.getEspecialidad(usuario.getEspecialidad()).ciclosDisponibles();
      if (ciclos.includes(ciclo)) {
        usuario.setCiclo(ciclo);
        this.enviaCursos(usuario);
      } else {
        this.FB.enviaTexto(usuario.id, "Ciclo no disponible.")
          .catch(e => console.log({error: e['message'], codigo: e['code']}));
      }
      return ;
    } else this.procesaComando(usuario, comando);
    return ;
  }
  if (respuesta.peticion) {
    const peticion = respuesta.peticion;
    /**
     * 26-05-19: Se habilita la peticion de Meme, se piensa que a futuro se puede
     * pedir notas de ORCE, calculos matematicos, musica o articulos de wikipedia
     */
    if (peticion === "Meme") {
      this.enviaMeme(usuario);
    }
  }
  let peticionCambio = false;
  try {
    peticionCambio = usuario.getEspecialidad() ? this.procesaPeticionTexto(usuario, texto.limpia()) : false;
  } catch (error) {
    console.log(error);
    usuario.peticionActual = new Peticion();
    this.FB.enviaTexto(usuario.id, error.message + "\nDebido a ese error se ha decidido reinciar tu peticion.")
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
  }
  let espec = usuario.getEspecialidad();
  if (!espec) {
    this.FB.enviaTexto(id, respuesta.texto)
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
    return false;
  }
  if (!peticionCambio) {
    this.FB.enviaTexto(id, respuesta.texto)
        .catch(e => console.log({error: e['message'], codigo: e['code']}));
  }
};
/**
 * Metodo para procesar las urls de archivos, es necesario indicar el tipo de
 * archivo para evitar conflictos con los servicios de facebook
 * @method procesaUrl
 * @param {String} id usuario de FB
 * @param {String[]} urls
 */
Bot.prototype.procesaUrl = async function (id, urls) {
  const data = await this.FB.getUserInfo(id);
  const user = JSON.parse(data);
  for (const url of urls) {
    const limpio = url.substr(0, url.indexOf('?'));
    const separado = limpio.split('/');
    let key = separado[separado.length - 1];
    key = "submissions/" + user.name.replace(/ /g, "_").limpia() + '/' + key;

    RequestPromise.get(url, {encoding: null, resolveWithFullResponse: true})
      .then((res) => {
        const mime = res.headers["content-type"] ? res.headers["content-type"] : "application/octet-stream";
        const body = res.body ? res.body : new Buffer("");
        return this.amazon.putObject(key, body, mime);
      })
      .then(() => {
        console.log(`Objeto colocado correctamente en: ${key}`);
      })
      .catch(e => console.log(e));
  }
  this.FB.enviaTexto(id, `Gracias ${user.name}.\nCon tu colaboración el proyecto seguirá creciendo.`)
      .catch(e => console.log({error: e['message'], codigo: e['code']}));
};
/**
 * Metodo para enviar un mensaje global que contenga texto y una
 * sola url que sera enviada como una vista previa.
 * @methods enviaMensajeGlobal
 * @param texto
 * @returns {Promise<void>}
 * @TODO comprobar el correcto funcionamiento del metodo, ahora espera las respuestas, pero el tiempo puede no ser suficiente, ultimo error: SLOW DOWN
 */
Bot.prototype.enviaMensajeGlobal = async function (texto) {
  const urls = linkify.find(texto);
  const longitudSublistas = 50, tiempoEspera = 1000*60*7.5;
  const listas = [];
  const ids = this.UNI.getUsuarios().map(usuario => usuario.id);
  const longitudTotal = ids.length;
  const wait = function (time) {
    return new Promise((res, rej) => {
      console.log("Tiempo fuera! esperando " + time + " milisegundos.");
      setTimeout(() => res(1), time);
    })
  };
  while (ids.length > 0) {
    listas.push(ids.splice(0, longitudSublistas));
  }
  const opciones = {
    messaging_type: "MESSAGE_TAG",
    tag: "NON_PROMOTIONAL_SUBSCRIPTION"
  };
  const url = urls ? urls[0].value : undefined;
  texto = texto.replace(url,'');
  console.log("Mensaje global: " + texto);

  for (let k = 0; k < listas.length; k++) {
    let usuarios = listas[k];
    for (let i = 0; i < usuarios.length; i++) {
      let id = usuarios[i];
      console.log("Enviando mensaje global #"+ (i + 1 + k*longitudSublistas) + " de " + (longitudTotal));
      try {
        if (texto.length > 0) await this.FB.enviaTexto(id, texto, opciones);
        if (url) await this.FB.enviaUrl(id, url, opciones);
      } catch (e) {
        console.log({error: e['message'], codigo: e['code']});
      }
      await wait(500);
    }
    await wait(tiempoEspera);
  }
};

module.exports = Bot;
