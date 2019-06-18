const Usuario = require('./facultad/Usuario')
const Facultad = require('./facultad/Facultad')
const Especialidad = require('./facultad/Especialidad')
/**
 * Clase que representa el estudiantado de la
 * Universidad Nacional de Ingenieria y sus facultades, 
 * se encarga de manejar las operaciones con usuarios y
 * facultades, como la creacion de nuevos ususarios o su busqueda
 * @class Universidad
 */
class Universidad {
  /**
   * @constructor
   */
  constructor() {
    /**
     * Mapa para las facultades, cuya clave es el id de la facultad
     * y cuyo valor es el objeto {Facultad}
     * @property {Map} facultades 
     * @type {Map<String,Facultad>}
     */
    this.facultades = new Map();
    /**
     * Mapa de usuarios, posee acceso aleatorio por lo que se facilita 
     * las operaciones, la clave es el id del usuario y el valor el 
     * objeto Usuario
     * @property {Map} usuarios 
     * @type {Map<String,Usuario>}
     */
    this.usuarios = new Map();
  }
}
/**
 * Metodo para cargar las facultades desde un objeto
 * @method cargaFacultades
 * @param {{id:String,especialidades:{id:String,malla:Object[]}[],directorio:Object,cursos:{codigo:String,nombre:String}[]}[]} _facultades 
 * contiene objetos con la informacion necesaria para crear las facultades, contiene la id, lista de especialidades, cursos y directorio, 
 * alterando este archivo se puede actualizar el funcionamiento de las facultades sin cambiar el codigo fuente.
 */
Universidad.prototype.cargaFacultades = function (_facultades) {
  /**
   * @type {Map<String,Facultad>}
   */
  let map = new Map();
  for (let facultad of _facultades) {
    map.set(facultad.id, new Facultad(facultad.id, facultad.especialidades, facultad.cursos, facultad.directorio));
  }
  this.facultades = map;
}
/**
 * Metodo para cargar los usuarios desde un objetos
 * @method cargaUsuarios
 * @param {{id:String,especialidad:String,ciclo:String,historial:String[],cantidadHistorica:Number,peticionActual:{curso:{codigo:String,nombre:String},carpeta:String}}[]} _usuarios contiene objetos con
 * informacion suficienta para crear usuarios
 */
Universidad.prototype.cargaUsuarios = function (_usuarios) {
  /**
   * @type {Map<String,Usuario>}
   */
  let map = new Map();
  for (let usuario of _usuarios) {
    map.set(usuario.id, new Usuario(usuario.id).carga(usuario))
  }
  /* for (let usuario of _usuarios) {
    this.usuarios[usuario.id] = new Usuario(usuario);
  } */
  this.usuarios = map;
}
/**
 * Metodo para crear un usuario de la universidad
 * @method creaUsuario
 * @param {String} id identificador para el nuevo usuario
 * @returns {Usuario}
 */
Universidad.prototype.creaUsuario = function (id) {
  this.usuarios.set(id, new Usuario(id));
  return this.usuarios.get(id);
}
/**
 * Metodo para obtener un usuario a partir de su id
 * @method getUsuario
 * @param {String} id
 * @returns {Usuario} usuario
 */
Universidad.prototype.getUsuario = function (id) {
  return this.usuarios.get(id);
}
/**
 * Metodo para obtener una especialidad a partir del id de esta 
 * especialidad
 * @method getEspecialidad
 * @param {String} id
 * @returns {Especialidad} especialidad
 */
Universidad.prototype.getEspecialidad = function (id) {
  for (let facultad of this.facultades.values()) {
    let especialidad = facultad.getEspecialidad(id);
    if (especialidad) return especialidad;
  }

}
/**
 * Metodo para obtener una facultad a partir del id de una de sus
 * especialidades
 * @method getFacultad
 * @param {String} idEspecialidad
 * @returns {Facultad}
 */
Universidad.prototype.getFacultad = function (idEspecialidad) {
  for (let facultad of this.facultades.values()) {
    let especialidad = facultad.getEspecialidad(idEspecialidad);
    if (especialidad) return facultad;
  }

}
/**
 * Metodo para obtener una lista de los id de las facultades
 * @method getFacultadesId
 * @returns {String[]}
 */
Universidad.prototype.getFacultadesId = function () {
  let keys = Array.from(this.facultades.keys())
  return keys;
}
/**
 * Metodo para obtener todas las facultades en Array
 * @method getFacultadesObject
 * @returns {Facultad[]}
 */
Universidad.prototype.getFacultadesObject = function () {
  let facultades = Array.from(this.facultades.values());
  return facultades;
}
/**
 * Metodo para obtener todos los usuarios en el registro
 * @method getUsuarios
 * @returns {Usuario[]}
 */
Universidad.prototype.getUsuarios = function () {
  let usuarios = Array.from(this.usuarios.values());
  return usuarios;
}
/**
 * Metodo para obtener las id de las especialidades
 * @method getEspecialidadesId
 * @returns {String[]}
 */
Universidad.prototype.getEspecialidadesId = function () {
  let facultades = this.getFacultadesObject();
  /**
   * @type {String[]}
   */
  let especialidades = facultades.flatMap(facultad => facultad.getEspecialidades());
  return especialidades;
}
/**
 * @todo metodo para obtener una lista de facultades y hacerla 
 * notacion de objeto como Array JSON para guardar a archivo, de igual 
 * manera con los usuarios, metodo para determinar si un usuario existe
 * y devolver una referencia a toda la data relacionada a ese usuario,
 * incluyendo su especialidad, un metodo para obtener una facultad a partir
 * de una especialidad
 */

module.exports = Universidad;