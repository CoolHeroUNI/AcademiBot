const Especialidad = require('./Especialidad')
const Peticion = require('./Peticion')
/**
 * Una clase para representar las propiedades basicas de una facultad, consiste de un nombre 
 * o identificador, una lista de especialidades detalladas en su propio archivo
 * @class Facultad
 */
class Facultad {
  /**
   * @constructor
   * Crea una nueva instancia de Especialidad
   * @param {String} id identificador de la Facultad
   * @param {Array} especialidades contiene {Object} para crear una especialidad
   * @param {{codigo:String,nombre:String}[]} cursos lista general de los cursos
   * @param {Object} directorio objeto que describe las carpetas de la base de datos
   */
  constructor(id, especialidades, cursos, directorio) {
    /**
     * @type {Map<String,Especialidad>}
     */
    let especs = new Map();
    for (let carrera of especialidades) {
      especs.set(carrera.id, new Especialidad(carrera.id, carrera.malla, cursos, directorio));
	  }
    /**
     * Identificador de la facultad
     * @property {String} id 
     * @type {String}
     */
    this.id = id;
    /**
     * Diccionario de especialidades 
     * @property {Map} especialidades 
     */
    this.especialidades = especs;
    /**
     * Lista de {codigo:String,nombre:String} cursos de la facultad, tienen nombre y codigo
     * @property {{codigo:String,nombre:String}[]} cursos 
     */
    this.cursos = cursos;
    /**
     * Directorio de la facultad, se encuentran todos los cursos, carpetas y archivos
     * @todo cambiar el formato a Map
     * @property {Object} directorio
     */
    this.directorio = directorio;
  }
}
/**
 * Comprobacion de pertenencia en lista de especialidades
 * @method getEspecialidad
 * @param {String} id
 * @return {Especialidad} ya sea si alguna especialidad tiene ese id
 * @todo crear una estructura de acceso aleatorio para optimizar el 
 * tiempo de busqueda ---------------------------------------Hecho
 */
Facultad.prototype.getEspecialidad = function (id) {
  let especialidad = this.especialidades.get(id);
  return especialidad;
}
/**
 * Getter para los ids de las especialidades
 * @method getEspecialidades
 * @return {String[]} contiene los id de las especialidades
 */
Facultad.prototype.getEspecialidades = function () {
  let especialidades = Array.from(this.especialidades.keys());
  return especialidades;
}
/**
 * Metodo para obtener la ruta absoluta de los archivos de una especialidad, ej: 
 * "fiis/algebra-lineal/1pc/16-2-1.jpg",
 * "fiis/algebra-lineal/1pc/16-2-2.jpg"
 * @method getRutas
 * @param {Peticion} peticion 
 * @param {String} especialidad id de la especialidad
 * @return {String[]} lista de rutas absolutas 
 */
Facultad.prototype.getRutas = function (peticion, especialidad) {
  const id = this.id;
  let rutasGlobales = this.especialidades.get(especialidad).getRutas(peticion).map(ruta => id + "/" + ruta);
  return rutasGlobales;
}
/**
 * Metodo estatico para crear un directorio
 * @method creaDirectorio
 * @param {String[]} direcciones
 * @return {Object} tipo directorio
 */
Facultad.creaDirectorio = function (direcciones) {
  let directorio = {};
  for (let key of direcciones) {
    let lista = key.split('/');
    const [facultad, curso, carpeta, archivo] = lista;
    if (!archivo || !~archivo.indexOf('.')) continue;
    if (!directorio[curso]) directorio[curso] = {};
    if (!directorio[curso][carpeta]) directorio[curso][carpeta] = [];
    directorio[curso][carpeta].push(archivo);
  }
  return directorio;
}
/**
 * Metodo para guardar el estado actual de la facultad
 * @method toJSON
 * @return {{id:String, especialidades:{id:String,malla:Object}[],cursos:{nombre:String,codigo:String}[],directorio:Object}} NO retorna el directorio
 */
Facultad.prototype.toJSON = function () {
  let _especialidades = Array.from(this.especialidades.values()).map(especialidad => especialidad.toJSON());
  let json = {id:this.id,especialidades:_especialidades,cursos:this.cursos,directorio:this.directorio};
  return json;
}
module.exports = Facultad;