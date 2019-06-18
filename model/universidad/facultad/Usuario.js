const Peticion = require("./Peticion")
/**
 * Una clase que representa los elementos importantes de un usuario
 * del ChatBot, como las peticiones que realiza y las limitaciones
 * que debe tener para evitar una fuga de datos.
 * @class Usuario
 */
class Usuario {
  /**
   * @constructor
   * @param {String} id id del usuario o un objeto para 
   * crear un usuario de informacion existente.
   */
  constructor (id) {
    /**
     * Identificador del Usuario
     * @property {String} id 
     * @type {String}
     */
    this.id = id;
    /**
     * Id de la Especialidad, se usará para ubicar al Usuario en la 
     * Especialidad correcta, y asi ofrecer el material adecuadamente
     * @property {String} especialidad 
     */
    this.especialidad = "";
    /**
     * Id del ciclo actual que el Usuario selecciona para solicitar
     * material, se reutilizara cuando se solicite material nuevamente
     * @property {String} ciclo 
     */
    this.ciclo = "";
    /**
     * Peticion del Usuario, definida en el archivo Peticion, contiene
     * informacion sobre el curso, carpeta y archivo y adicional
     * @property {Peticion} peticionActual 
     * @type {Peticion}
     */
    this.peticionActual = new Peticion();
    /**
     * Arreglo de Peticiones en forma de String, ayudara a no presentar 
     * material que se ha solicitado anteriormente
     * @property {String[]} historial
     * @type {String[]}
     */
    this.historial = [];
    /**
     * Contador de la cantidad de peticiones realizadas exitosamente,
     * se utilizara para restringir las solicitudes y datos estadisticos
     * @property {Number} cantidadPeticiones 
     */
    this.cantidadPeticiones = 0;
    /**
     * Contador de la cantidad de peticiones realizadas exitosamente
     * en total, se utilizara para estadisticas
     * @property {Number} cantidadHistorica 
     */
    this.cantidadHistorica = 0;
    /**
     * Variable que indicara si el usuario esta habilitado para completar
     * una peticion
     * @property {Boolean} habilitado 
     */
    this.habilitado = true;
  }
}
/**
 * Metodo para cargar al usuario a partir de un objeto usuario
 * @method carga
 * @param {{id:String,especialidad:String,ciclo:String,historial:String[],cantidadHistorica:Number,peticionActual:{curso:{codigo:String,nombre:String},carpeta:String}}} _usuario
 * @returns {Usuario} referencia this
 */
Usuario.prototype.carga = function (_usuario) {
  this.especialidad = _usuario.especialidad;
  this.ciclo = _usuario.ciclo;
  this.historial = _usuario.historial;
  this.cantidadHistorica = _usuario.cantidadHistorica;
  this.peticionActual = new Peticion(_usuario.peticionActual);
  return this;
}
/**
 * Metodo para obtener una referencia a la peticion actual
 * @method getPeticion
 * @returns {Peticion}
 */
Usuario.prototype.getPeticion = function () {
  return this.peticionActual;
}
/**
 * Reinicia el contador actual de peticiones y habilita al usuario para
 * realizar mas peticiones
 * @method reiniciaContador
 */
Usuario.prototype.reiniciaContador = function () {
  this.cantidadPeticiones = 0;
  this.habilitado = true;
}
/**
 * Añade la peticion actual a la lista de peticiones historicas, si hay
 * de 10, borra la mas antigua, reinicializa la peticion actual en una
 * peticion vacia, aumenta los contadores de cantidades de peticion e
 * invoca a baneaSi.
 * @method completaPeticion
 */
Usuario.prototype.completaPeticion = function () {
  this.historial.push(this.peticionActual.toString());
  while (this.historial.length > 5) this.historial.shift();
  this.peticionActual = new Peticion(this.peticionActual);
  this.cantidadPeticiones++;
  this.cantidadHistorica++;
}
/**
 * Actualiza el valor del ciclo al que pertenece el usuario
 * @method setCiclo
 * @param {String} ciclo
 */
Usuario.prototype.setCiclo = function (ciclo) {
  this.ciclo = ciclo;
}
/**
 * Actualiza el valor del identificador de la Especialidad
 * @method setEspecialidad
 * @param {String} especialidad
 */
Usuario.prototype.setEspecialidad = function (especialidad) {
  this.baneaSi(this.tieneEspecialidad());
  this.desBan(60);
  this.especialidad = especialidad;
  this.ciclo = "";
  this.peticionActual = new Peticion();
}
/**
 * Metodo para comprobar si tiene especialidad
 * @method tieneEspecialidad
 * @returns {Boolean}
 */
Usuario.prototype.tieneEspecialidad = function () {
  return this.especialidad !== "";
}
/**
 * Metodo para obtener el id de la especialidad
 * @method getEspecialidad
 * @returns {String}
 */
Usuario.prototype.getEspecialidad = function () {
  return this.especialidad;
}
/**
 * Metodo para obtener el ciclo del ususario
 * @method getCiclo
 * @returns {String}
 */
Usuario.prototype.getCiclo = function () {
  return this.ciclo;
}
/**
 * Si el usuario esta habilitado y excedio la cantidad de peticiones se
 * le revoca la facultad de realizar peticiones durante el tiempo indicado
 * en coolDown
 * @method baneaSi
 * @param {Boolean} condicion 
 */
Usuario.prototype.baneaSi = function (condicion) {
  if (condicion) {
    this.habilitado = false;
  }
}
/**
 * Metodo para quitar el Ban a un usuario en un determinado momento
 * @method desBan
 * @param {Number} [tiempo] tiempo en segundos, por defecto coolDown
 */
Usuario.prototype.desBan = function (tiempo) {
  tiempo = tiempo ? tiempo : Usuario.coolDown;
  let that = this;
  if (!this.habilitado) setTimeout(() => that.reiniciaContador(), tiempo);
}
/**
 * Metodo para poder convertir al usuario a un Objeto simple
 * @method toJSON
 * @returns {Object}
 */
Usuario.prototype.toJSON = function () {
  let usuario = {
    id : this.id,
    especialidad :this.especialidad,
    ciclo :this.ciclo,
    historial :this.historial,
    cantidadHistorica :this.cantidadHistorica,
    peticionActual :this.peticionActual.toJSON()
  }
  return usuario;
}
/**
 * Variable estatica para definir el limite de solicitudes que puede
 * completar un Usuario antes de ser penalizado.
 * @static limitePeticionEnTiempo {Integer}
 */
Usuario.limitePeticionEnTiempo = 25; 
/**
 * Variable estatica para definir el tiempo de penalizacion que recibira
 * el usuario al exceder el limitePeticionEnTiempo
 * @static coolDown {Integer}
 */
Usuario.coolDown = 10; // Cooldown en segundos
/**
 * Actualiza el valor de cooldown para los usuarios
 * @static
 * @method setCooldown
 * @param {Integer} tiempo
 */
Usuario.setCoolDown = function (tiempo) {
  Usuario.coolDown = tiempo;
}
/**
 * Actualiza el valor del limite de peticiones
 * @static
 * @method setLimite
 * @param {Integer} cantidad
 */
Usuario.setLimite = function (cantidad) {
  Usuario.limitePeticionEnTiempo = cantidad;
}
/**
 * @todo temporizador personal para reiniciar el contador de examenes cada hora
 */
module.exports = Usuario;