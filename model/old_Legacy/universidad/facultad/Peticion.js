/**
 * Clase para representar una solicitud por parte del Usuario para obtener archivos. Consta de
 * un curso, carpeta, archivo y seccion que describen la ruta en donde están los archivos.
 * @class Peticion
 */
class Peticion {
  /**
   * @constructor
   * @param {Peticion | {curso:{codigo:String,nombre:String},carpeta:String}} [anterior] 
   * ya sea si se instancia a partir de una peticion anterior o de un objeto debido a un reinicio
   */
  constructor (anterior) {
    let curso = {codigo:"",nombre:""};
    let carpeta = "";
    if (anterior && anterior.curso && anterior.carpeta) {
      curso = anterior.curso;
      carpeta = anterior.carpeta;
    }
    /**
     * Curso del que se quiere obtener material, consta de codigo y nombre
     * @property {{codigo:String,nombre:String}} curso 
     */
    this.curso = curso;
    /**
     * Nombre de la carpeta en la que se busca el material, representa los diferentes tipos de
     * examenes o material adicional
     * @property {String} carpeta 
     */
    this.carpeta = carpeta;
    /**
     * Identificador del archivo que corresponde a determinado ciclo
     * @property {String} archivo 
     */
    this.archivo = "";
    /**
     * Identificador opcional de seccion, no es necesario que este presente para que la peticion
     * sea valida
     * @property {String} seccion 
     */
    this.seccion = "";
  }
}
/**
 * Comprobacion de una peticion vacia, sin curso ni carpeta es considerada vacia, ya que sin 
 * ninguno de estos no se puede tener una peticion
 * @method esVacia
 * @returns {Boolean}
 */
Peticion.prototype.esVacia = function () {
  return (!this.getCursoNombre() && !this.getCarpeta());
};
/**
 * Comprobacion de una peticion valida, que consta de curso, carpeta y archivo
 * @method esValida
 * @returns {Boolean} ya sea si es valida o no
 */
Peticion.prototype.esValida = function () {
  return (this.curso.codigo !== "" && this.carpeta !== "" && this.archivo !== "");
};
/**
 * Getter para el codigo de la propiedad curso
 * @method getCursoCodigo
 * @returns {String} String o "" si esta vacio
 */
Peticion.prototype.getCursoCodigo = function () {
  return this.curso.codigo;
};
/**
 * Getter para el nombre de la propiedad curso
 * @method getCursoNombre
 * @returns {String} String o "" si esta vacio
 */
Peticion.prototype.getCursoNombre = function () {
  return this.curso.nombre;
};
/**
 * Getter para el objeto curso, con propiedades nombre y codigo, si no existe retorna false
 * @method getCurso
 * @returns {{codigo:String,nombre:String}|Boolean} 
 */
Peticion.prototype.getCurso = function () {
  if (this.getCursoCodigo()) return this.curso;
  return false;
};
/**
 * Getter para la propiedad carpeta
 * @method getCarpeta
 * @returns {String} String que identifica la carpeta
 */
Peticion.prototype.getCarpeta = function () {
  return this.carpeta;
};
/**
 * Getter para la propiedad archivo
 * @method getArchivo
 * @returns {String} String o false si esta vacio
 */
Peticion.prototype.getArchivo = function () {
  return this.archivo;
};
/**
 * Getter para la propiedad seccion
 * @method getSeccion
 * @returns {String} String o false si esta vacio
 */
Peticion.prototype.getSeccion = function () {
  return this.seccion;
};
/**
 * Setter para la propiedad curso, reinicia los valores de carpeta, archivo y seccion,
 * lanza un error si se intenta asignar un objeto no valido
 * @method setCurso
 * @param {{codigo:String,nombre:String}} curso el objecto del curso
 */
Peticion.prototype.setCurso = function (curso) {
  if (curso.codigo || curso.nombre) {
    this.curso = curso;
    this.resetCarpeta();
  } else {
    throw new Error("Objeto curso no valido")
  }
};
/**
 * Setter para la propiedad carpeta, reinicia los valores de archivo y seccion,
 * lanza un error si no existe un curso al que asignar carpeta
 * @method setCarpeta
 * @param {String} nombre el nombre del carpeta
 */
Peticion.prototype.setCarpeta = function (nombre) {
  if (this.getCurso()) {
    this.carpeta = nombre;
    this.resetArchivo();
  } else {
    throw new Error ("No es posible asignar una carpeta sin un curso.")
  }
};
/**
 * Setter para la propiedad archivo, reinicia el valor de  seccion, lanza
 * error si no existe carpeta o curso
 * @method setArchivo
 * @param {String} nombre el nombre del archivo
 */
Peticion.prototype.setArchivo = function (nombre) {
  if (this.getCarpeta() && this.getCurso()) {
    this.archivo = nombre;
    this.resetSeccion();
  } else {
    throw new Error ("No es posible asignar un archivo sin una carpeta.")
  }
};
/**
 * Setter para la propiedad seccion, lanza un error si no hay archivo
 * @method setSeccion
 * @param {String} codigo el codigo del seccion
 */
Peticion.prototype.setSeccion = function (codigo) {
  if (this.getArchivo()) this.seccion = codigo;
  else throw new Error("No se puede asignar seccion sin un archivo.")
};
/**
 * Metodo para reiniciar el valor de carpeta, archivo y seccion a una cadena vacia
 * @method resetCarpeta
 */
Peticion.prototype.resetCarpeta = function () {
  this.carpeta = "";
  this.resetArchivo();
};
/**
 * Metodo para reiniciar el valor de archivo y seccion a una cadena vacia
 * @method resetArchivo
 */
Peticion.prototype.resetArchivo = function () {
  this.archivo = "";
  this.resetSeccion();
};
/**
 * Metodo para reiniciar el valor de seccion a una cadena vacia
 * @method resetSeccion
 */
Peticion.prototype.resetSeccion = function () {
  this.seccion = "";
};
/**
 * Metodo para llenar los campos con los de un objeto que contiene lo necesario
 * @method cargaDesdeJSON
 * @param {{curso:{codigo:String,nombre:String},carpeta:String,archivo:String,seccion:String}} peticion objeto 
 * con las propiedades necesarias para construir una peticion
 */
Peticion.prototype.cargaDesdeJSON = function (peticion) {
  if (peticion.curso) this.setCurso(peticion.curso);
  if (peticion.carpeta) this.setCarpeta(peticion.carpeta);
  if (peticion.archivo) this.setArchivo(peticion.archivo);
  if (peticion.seccion) this.setSeccion(peticion.seccion);
};
/**
 * Metodo para convertir la peticion a una cadena, permite comparabilidad
 * @method toString
 * @returns {String} cadena de tipo "carpeta de curso del archivo ¿seccion?"
 */
Peticion.prototype.toString = function () {
  let resultado = `${this.getCarpeta()} de ${this.getCursoNombre()} del ${this.getArchivo()}`;
  if (this.getSeccion()) resultado += ` ${this.getSeccion()}`;
  return resultado;
};
/**
 * Metodo para convertir la peticion a Object que puede ser guardada
 * @method toJSON
 * @returns {{curso:{codigo:String,nombre:String},carpeta:String}}
 */
Peticion.prototype.toJSON = function () {
  return {
    curso: {
      codigo: this.getCursoCodigo(),
      nombre: this.getCursoNombre()
    },
    carpeta: this.getCarpeta()
  };
};
module.exports = Peticion;