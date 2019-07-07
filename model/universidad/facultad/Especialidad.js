const Peticion = require('./Peticion');
/**
 * Una clase que representa los elementos necesarios de una
 * especialidad, consta de un id que la distingue, una malla
 * curricular que consta a su vez de ciclos y cursos
 * @class Especialidad
 */
class Especialidad {
  /**
   * @constructor
   * @param {String} id identifica a la Especialidad
   * @param {Object[]} mallaCurricular lista de {Object} que 
   * representan a un semestre academico, estos tienen una
   * propiedad {String} id, que identifica un semestre y {Array} 
   * de {Object} que son los cursos de dicho ciclo identificados
   * por un {String}
   * @param {{codigo:String,nombre:String}[]} cursos array de {Object} que tiene propiedades
   * {String} codigo, que identifica a un curso y {String} nombre
   * que corresponde al nombre completo de dicho curso, relacionando
   * asi los cursos del anterior {Object} _especialidad con sus
   * respectivos nombres, si no existiera un curso en este {Array}
   * se bloquea la ejecucion del codigo
   * @param {Object} _direcciones objeto que contiene el directorio
   * generado por amazon de todas las direcciones de los cursos de 
   * la facultad, se utilizara para poder comparar los textos con 
   * cada parte del objeto y determinar si corresponde a un curso,
   * carpeta, archivo o seccion
   */
  constructor (id, mallaCurricular, cursos, _direcciones) {
    let directorio = {};
    let malla = mallaCurricular;
    let cursosPropiedad = [];
    for (let i = 0; i < malla.length; i++) {
      // La malla esta compuesta por ciclos
      let ciclo = malla[i];
      for (let j = 0; j < ciclo.cursos.length; j++) {
        // Los ciclos estan compuestos por codigos que representan cursos
        let _curso = ciclo.cursos[j];
        let found = cursos.find((curso) => curso.codigo === _curso.codigo);
        // Si el codigo se encuentra en la lista de cursos, es consistente
        if (found) {
          // Se almacena el objeto curso
          // malla[i].cursos[j] = found;
          cursosPropiedad.push(found);
        } else {
          // Si no está en la lista, entonces no es consistente
          throw new Error(`Error, codigo=${codigo} no se encuentra en la lista. id=${id}, ciclo=${ciclo.id}`);
        }
      }
    }
    // Lista de cursos presente en _direcciones
    let subjects = Object.getOwnPropertyNames(_direcciones);
    for (let curso of cursosPropiedad) {
      // Se busca el nombre del curso de la lista actual en _direcciones
      let found = subjects.find((_curso) => _curso === curso.nombre);
      if (found) {
        // Si se encuentra, se copia el contenido de _direcciones
        directorio[curso.nombre] = _direcciones[curso.nombre];
      } else {
        // Que el nombre no se encuentre en _direcciones es causal de Error
        // throw new Error(`Error, ${curso} no se encuentra en el directorio.`)
        // console.log(`No existe: nombre=${curso.nombre} en ${id}.`);
      }
    }
    /**
     * Identificador de la Especialidad
     * @property {String} id 
     */
    this.id = id;
    /**
     * Malla curricular de la especialidad, {Array} de {Object} 
     * denominados en adelante ciclos, cada uno tiene propiedades
     * {String} id, {Array} cursos, cada elemento de cursos es 
     * {Object} que tiene propiedades {String} codigo, {String} nombre
     * que identifican a un curso
     * @property {Array} malla 
     */
    this.malla = malla;
    /**
     * Lista simple de cursos, {Object} que contienen {String} nombre
     * y {String} codigo
     * @property {{codigo:String,nombre:String}[]} cursos 
     */
    this.cursos = cursosPropiedad;
    /**
     * Objeto que representa el directorio propio de esta especialidad, 
     * sigue una estructura tipo arbol, como ejemplo, directorio[curso]
     * es tambien un objeto, directorio[curso][carpeta] es un {Array} 
     * donde se encuentran cadenas que representan archivos
     * @property {{curso:{carpeta:{archivos[]}}}} directorio 
     */
    this.directorio = directorio;
  }
}
/**
 * Metodo que obtiene la lista de cursos de determinado ciclo en la 
 * malla curricular
 * @method getCursosDeCiclo
 * @param {String} ciclo
 * @returns {{codigo:String,nombre:String}[]}
 */
Especialidad.prototype.getCursosDeCiclo = function (ciclo) {
  // Se busca en la malla el ciclo que tenga por id lo recibido por
  // parametro, luego se accede a la propiedad cursos

  return this.malla
      .find(_ciclo => _ciclo.id === ciclo).cursos
      .filter((curso) => this.directorio[curso.nombre]);
};
/**
 * Retorna un array de ids de los ciclos que tienen algun curso
 * @method ciclosDisponibles
 * @return {String[]}  
 */
Especialidad.prototype.ciclosDisponibles = function () {
  const ciclosDisponibles = [];
  for (let ciclo of this.malla) {
    if (ciclo.cursos.length !== 0) ciclosDisponibles.push(ciclo.id)
  }
  return ciclosDisponibles;
};
/**
 * Compara una cadena y determina el curso al que corresponde, 
 * utiliza la lista de cursos local, esto ahorra el tener que 
 * computarla con cada llamada
 * @method comparaCurso
 * @param {String} mensaje cadena a comparar
 * @return {Object|Boolean} ya sea el curso o false
 * @todo mejorar eficiencia, que se compare coincidencia exacta 
 * antes de por palabras --------------- Hecho
 */
Especialidad.prototype.comparaCurso = function (mensaje) {
  const cursos = this.cursos.filter(curso => this.directorio[curso.nombre]);
  // Los mensajes largos no contienen peticiones
  if (mensaje.length > 75) return false;
  let palabras = mensaje.split(' ');
  for (let curso of cursos) {
    // Se inicia la comparacion con 
    // Creacion de RegExp para comprobar si en mensaje esta el codigo del curso
    let expresionCodigo = new RegExp(curso.codigo.replace(/-/g,'(-| )'),'i');
    let expresionNombre = new RegExp(curso.nombre.replace(/-/g,'(-| )'),'i');
    if (expresionCodigo.test(mensaje) || expresionNombre.test(mensaje)) return curso;
  }
  // Los mensajes con muchas palabras no contienen peticiones
  if (palabras.length > 15) return false;
  for (let curso of cursos) {
    for (let palabra of palabras) {
      // El curso con menor cantidad de letras es io 1, que sera renombrado, por
      // tal motivo es necesario restringir para evitar coincidencias accidentales
      if (palabra.length < 5) continue;
      // ~-1 -> 0, if(0) -> false, por tal motivo se usa
      if (~curso.nombre.indexOf(palabra)) return curso;
    }
  }
  return false;
};
/**
 * Comprueba si una cadena esta en la lista de carpetas de un curso 
 * @method comparaCarpeta
 * @param {String} curso nombre del curso
 * @param {String} mensaje cadena a comparar
 * @return {String|Boolean} ya sea el codigo del curso o false
 */
Especialidad.prototype.comparaCarpeta = function (curso, mensaje) {
  // Si no existe la lista de un curso entonces no se puede buscar
  if (!this.directorio[curso]) return false;
  // Si se busca una pc, se necesita que el numero este inmediatamente seguido de "pc"
  let index = mensaje.search(/[0-9]/);
  if (~index && mensaje[index + 1] === " ") mensaje = mensaje.substr(0,index) + mensaje.substr(index + 1);
  // Declaracion del arreglo con las palabras del mensaje
  let palabras = mensaje.split(' ');
  // Lista de las carpetas bajo el curso
  let carpetas = Object.getOwnPropertyNames(this.directorio[curso]);
  for (let carpeta of carpetas) {
    // Se crea una regexp para evaluar que los mensajes contengan algo de la carpeta
    let expresion = new RegExp(carpeta.replace(/-/g,'(-| )'),'i');
    if (expresion.test(mensaje)) return carpeta;
    // Se evaluara si las palabras contienen parte de una carpeta
    // El tamaño minimo se determina por el tamaño de la carpeta
    let minimo = carpeta.length > 3 ? 5 : 3;
    for (let palabra of palabras) {
      if (palabra.length < minimo) continue;
      if (~carpeta.indexOf(palabra)) return carpeta;
      if (~carpeta.replace(/-/g,' ').indexOf(palabra)) return carpeta;
    }
  }
  return false;
};
/**
 * Compara una cadena con los archivos dentro de la carpeta del curso buscado
 * @method comparaArchivo
 * @param {String} curso el curso en el que se encuentra carpeta
 * @param {String} carpeta la carpeta en la que se hara la busqueda
 * @param {String} mensaje la cadena a comparar
 * @return {String} ya sea si encaja o no
 */
Especialidad.prototype.comparaArchivo = function (curso, carpeta, mensaje) {
  if (!this.directorio[curso]) return "";
  if (!this.directorio[curso][carpeta]) return "";
  let archivos = this.directorio[curso][carpeta];
  for (let archivo of archivos) {
    archivo = archivo.substr(0, archivo.indexOf('.'));
    let lista = archivo.split('-');
    // compendio-1 -> [compendio, 1]
    // 19-1-primera -> [19, 1, primera]
    const [primero, segundo] = lista;
    let construido = `${primero}`;
    if (!isNaN(primero)) construido += `-${segundo}`;
    // compendio -> False
    // 18 -> True
    let comparativo = new RegExp(construido.replace(/-/g,'(| |-)'),'i');
    if (comparativo.test(mensaje)) return construido;
  }
  return "";
};
/**
 * Obtiene la seccion a la que se refiere una cadena
 * @method comparaSeccion
 * @param {Boolean} tieneArchivo ya sea si hay un archivo en la cadena
 * @param {String} mensaje cadena a comparar
 * @return {String} si tiene o no seccion
 */
Especialidad.prototype.comparaSeccion = function (tieneArchivo, mensaje) {
  let mensajeSinEspacios = mensaje.replace(/ /g,'');
  let indice = mensajeSinEspacios.indexOf('seccion');
  // Si la palabra seccion se encuentra explicitamente en la cadena
  if (~indice) {
    return mensajeSinEspacios[indice + 6 + 1];
    // 6 === 'seccion'.length, 
  }
  // Si el mensaje tiene una archivo, es muy probable que se encuentre en el formato
  // ...xx-x-seccion, con dos guiones separando o 
  // ...xx-xseccion, como no tiene espacios se puede obtener la seccion
  if (tieneArchivo) {
    let elementos = mensajeSinEspacios.split('-');
    // 17-1-u -> [17, 1, u]
    // 19-1-primera -> [19, 1, primera]
    // elementos[2] === "primera"
    if (elementos[2]) return elementos[2];
    // 19-1x
    if (elementos[1] && /^[1-3][a-z]/i.test(elementos[1])) return elementos[1][1];
  }
  return "";
};
/**
 * Compara una cadena y determina el curso, carpeta, archivo y seccion que
 * una instancia de {Peticion} tendria, de acuerdo a la malla curricular
 * @method parse
 * @param {String} mensaje la cadena a comparar
 * @param {Peticion} peticion el objeto que representa la peticion
 * @return {Object} resultado objeto para construir peticion
 */
Especialidad.prototype.parse = function (mensaje, peticion) {
  console.log("Parseando mensaje: ",mensaje);
  let resultado = {};
  // Compara el mensaje buscando curso, si no se obtiene de peticion
  let curso = this.comparaCurso(mensaje);
  // Compara el mensaje buscando carpeta, si no se obtiene de peticion
  let carpeta = this.comparaCarpeta(curso.nombre, mensaje) || this.comparaCarpeta(peticion.getCursoNombre(), mensaje);
  // Compara el mensaje buscando archivo, si no se obtiene de peticion
  let archivo = this.comparaArchivo(curso.nombre, carpeta, mensaje) || 
                this.comparaArchivo(peticion.getCursoNombre(), peticion.getCarpeta(), mensaje);
                
  // Booleano para comprobar si el mensaje contiene archivo
  let tieneArchivo = !!archivo;
  let seccion = this.comparaSeccion(tieneArchivo, mensaje);
  // Construye el objeto
  if (curso) resultado['curso'] = curso;
  if (carpeta) resultado['carpeta'] = carpeta;
  if (archivo) resultado['archivo'] = archivo;
  if (seccion) resultado['seccion'] = seccion;
  console.log(resultado);
  return resultado;
};
/**
 * Metodo para obtener las rutas a los archivos a partir de una peticion valida
 * @method getRutas
 * @param {Peticion} peticion 
 * @return {Array} lista de {String} que representan la ruta local a los archivos
 */
Especialidad.prototype.getRutas = function (peticion) {
  const resultados = [];
  const curso = peticion.getCursoNombre();
  const carpeta = peticion.getCarpeta();
  const nombreArchivo = peticion.getArchivo();
  const seccion = peticion.getSeccion();
  let busqueda = `${nombreArchivo}`;
  if (seccion) busqueda += `-${seccion}`;
  const comparador = new RegExp(busqueda);
  for (let archivo of this.directorio[curso][carpeta]) {
    // archivo tiene extension tambien: .jpg, .png, .pdf, etc...
    if (comparador.test(archivo)) resultados.push(`${curso}/${carpeta}/${archivo}`);
  }
  return resultados;
};
/**
 * Metodo que determina lo que un usuario necesita para poder completar su peticion
 * @method getDeDirectorio
 * @param {Peticion} peticion
 * @returns {{tipo:String, opciones:String[]}}
 */
Especialidad.prototype.getDeDirectorio = function (peticion) {
  let curso = peticion.getCurso();
  let carpeta = peticion.getCarpeta();
  if (!carpeta) {
    let carpetas = this.directorio[curso.nombre];
    return {
      tipo: "carpeta",
      opciones: Object.getOwnPropertyNames(carpetas)
    };
  }
  
  /**
   * @type {String[]}
   */
  const archivos = this.directorio[curso.nombre][carpeta]
    .map(archivo => {
      /**
       * @type {String}
       */
      let _archivo = archivo.substr(0,archivo.indexOf('.'));
      let items = _archivo.split('-');
      /**
       * primero debe ser el año de la prueba o puede ser el nombre completo de un 
       * archivo pdf, si existe el tercero entonces existe el segundo y si el tercero
       * es texto (isNaN(tercero) == true) entonces el cuarto es el numerador, caso
       * contrario; si el segundo existe y el primero si es numero 
       * (!isNaN(primero) == false) entonces el primero es el año de la prueba, y el 
       * segundo debe ser el semestre de la prueba, siendo el tercero o nada o el 
       * numerador.
       */
      const [primero, segundo, tercero] = items;
      let nombre = `${primero}`;
      if (tercero && isNaN(tercero)) {
        nombre += `-${segundo}-${tercero}`;
      } else if (segundo && !isNaN(primero)) {
        nombre += `-${segundo}`;
      }
      return nombre;
    });
  // Se filtran los repetidos
  return {
    tipo: "archivo",
    opciones: archivos.filter((archivo, index, self) => {
      return self.indexOf(archivo) === index;
    })
  };
};
/**
 * Metodo para guardar el estado de la facultad
 * @method toJSON
 * @return {{id:String,malla:}}
 */
Especialidad.prototype.toJSON = function () {
  return {id:this.id,malla:this.malla};
};
module.exports = Especialidad;