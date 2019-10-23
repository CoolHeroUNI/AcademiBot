
/**
 * Una clase que cubre los atributos del usuario de AcademiBot, identificado por un numero en la red social Facebook
 * @class Usuario
 */
class Usuario {
  /**
   * @constructor
   * @param {Number} FacebookId
   */
  constructor (FacebookId) {
    if (!FacebookId) throw new Error("Campo FacebookId debe ser no nulo para la instanciacion.");
    /**
     * Identificador del Usuario en Facebook
     * @property FacebookId
     * @type {Number}
     */
    this.FacebookId = FacebookId;
    /**
     * Codigo de la especialidad, se usara para brindar al usuario los cursos correspondientes a su especialidad
     * @property Especialidad
     * @type {String}
     */
    this.Especialidad = null;
    /**
     * Numero del ciclo que el usuario selecciono
     * @property Ciclo
     * @type {Number}
     */
    this.Ciclo = null;
    /**
     * Codigo del curso que el usuario ha seleccionado
     * @property Curso
     * @type {String}
     */
    this.Curso = null;
    /**
     * Nombre de la carpeta del curso de la que se quiere obtener archivos
     * @property Carpeta
     * @type {String}
     */
    this.Carpeta = null;
    /**
     * Contador de la cantidad de peticiones realizadas por el usuario
     * @property CantidadPeticiones
     * @type {Number}
     */
    this.CantidadPeticiones = 0;
    /**
     * Atributo que detalla el momento de la ultima interaccion con el usuario
     * @property UltimaInteraccion
     * @type {Date}
     */
    this.UltimaInteraccion = new Date(Date.now());
    this.AceptaPublicidad = true;
    this.FechaCreacion = new Date(Date.now());
    this.Valido = true;
  }
}


/**
 * Metodo para cargar la informacion secundaria del usuario a partir de un objeto proveido por la base de datos
 * @method cargaDesdeObjeto
 * @param {{Ciclo: Number, Carpeta: String, Especialidad: String, CantidadPeticiones: Number, Curso: String}} DataPacket
 * @returns {Usuario} referencia a esta instancia de usuario
 */
Usuario.prototype.cargaDesdeObjeto = function (DataPacket) {
  this.Especialidad = DataPacket['Especialidad'] || null;
  this.Curso = DataPacket['Curso'] || null;
  this.Ciclo = DataPacket['Ciclo'] || null;
  this.Carpeta = DataPacket['Carpeta'] || null;
  this.CantidadPeticiones = DataPacket['CantidadPeticiones'] || 0;
  this.AceptaPublicidad = DataPacket['AceptaPublicidad'] || true;
  this.FechaCreacion = DataPacket['FechaCreacion'] || this.FechaCreacion;
  this.Valido = DataPacket['Valido'] || 1;
};
/**
 * Metodo para aumentar en uno la cantida de peticiones del usuario
 * @method aumentaPeticion
 */
Usuario.prototype.aumentaPeticion = function () {
  this.CantidadPeticiones++;
};
/**
 * Metodo para asignar a un usuario una especialidad
 * @param {String} Especialidad
 */
Usuario.prototype.setEspecialidad = function (Especialidad) {
  this.Especialidad = Especialidad;
  this.Curso = null;
  this.Carpeta = null;
  this.Ciclo = null;
};
Usuario.prototype.getEspecialidad = function () {
  return this.Especialidad;
};
/**
 * Metodo para asignar un curso a un usuario
 * @param {String} Curso
 */
Usuario.prototype.setCurso = function (Curso) {
  if (!this.Especialidad) throw new Error("No es posible asignar un curso sin especialidad.");
  this.Curso = Curso;
  this.Carpeta = null;
};
Usuario.prototype.getCurso = function () {
  return this.Curso;
};
/**
 * Metodo para asignar una carpeta de archivos a un usuario
 * @param {String} Carpeta
 */
Usuario.prototype.setCarpeta = function (Carpeta) {
  if (!this.Curso) throw new Error("No es posible asignar una carpeta sin conocer el curso.");
  this.Carpeta = Carpeta;
};
Usuario.prototype.getCarpeta = function () {
  return this.Carpeta;
};
/**
 * Metodo para asignar un ciclo a un usuario
 * @param {Number} Ciclo
 */
Usuario.prototype.setCiclo = function (Ciclo) {
  this.Ciclo = Ciclo;
};
Usuario.prototype.getCiclo = function () {
  return this.Ciclo
};
/**
 * Metodo para obtener el identificador del usuario
 * @returns {Number}
 */
Usuario.prototype.getFacebookId = function () {
  return this.FacebookId;
};
Usuario.prototype.isAbleToRequestCourses = function () {
  return this.getEspecialidad() && this.getCiclo();
};
Usuario.prototype.isAbleToRequestFolders = function () {
  return this.isAbleToRequestCourses() && this.getCurso();
};
Usuario.prototype.isAbleToRequestFiles = function () {
  return this.isAbleToRequestFolders() && this.getCarpeta();
};
Usuario.prototype.reset = function () {
  this.setCurso(null);
};
/**
 * Metodo para obtener la data del usuario en forma de objeto, permite la rapida asignacion de variables
 * @returns {{Ciclo: Number, Carpeta: String, FacebookId: Number, Especialidad: String, UltimaInteraccion: Date,
 * Valido: Boolean, CantidadPeticiones: Number, Curso: String, AceptaPublicidad: Boolean, FechaCreacion: Date}}
 */

Usuario.prototype.getData = function () {
  return {
    FacebookId : this.FacebookId,
    Especialidad : this.Especialidad,
    Curso : this.Curso,
    Ciclo : this.Ciclo,
    Carpeta : this.Carpeta,
    CantidadPeticiones : this.CantidadPeticiones,
    UltimaInteraccion : this.UltimaInteraccion,
    AceptaPublicidad : this.AceptaPublicidad,
    FechaCreacion : this.FechaCreacion,
    Valido : this.Valido
  }
};
Usuario.prototype.getUpdateData = function () {
  return {
    Especialidad : this.Especialidad,
    Curso : this.Curso,
    Ciclo : this.Ciclo,
    Carpeta : this.Carpeta,
    CantidadPeticiones : this.CantidadPeticiones,
    AceptaPublicidad : this.AceptaPublicidad,
    Valido : this.Valido
  }
};

module.exports = Usuario;