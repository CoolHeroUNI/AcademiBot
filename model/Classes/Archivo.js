class Archivo {
    /**
     * @param {String} Key
     */
    constructor (Key) {
        const [Facultad, Curso, Carpeta, Nombre] = Key.split('/');
        if (!Facultad || !Curso || !Carpeta || !Nombre) throw new Error("Clave invalida " + Key);
        /**
         * Atributo que indica la ubicacion (ruta) del archivo en el sistema de archivos
         * @property Key
         * @type {String}
         */
        this.Key = Key;
        /**
         * Atributo que indica el curso al que pertenece el archivo
         * @property Curso
         * @type {String}
         */
        this.Curso = Curso;
        /**
         * Atributo que indica la facultad en la que estan contenidos los archivos, se diferencia entre facultades
         * debido al modelo que maneja la universidad de examenes diferenciados
         * @type {String}
         */
        this.Facultad = Facultad;
        /**
         * Atributo que indica la carpeta bajo la que se encuentra este archivo
         * @property Carpeta
         * @type {String}
         */
        this.Carpeta = Carpeta;
        /**
         * Atributo que indica el id de reutilizacion del archivo
         * @property ReuseId
         * @type {Number}
         */
        this.ReuseId = null;
        /**
         * Atributo que indica la cantidad de veces que un archivo fue solicitado
         * @property ContadorPeticiones
         * @type {Number}
         */
        this.ContadorPeticiones = 0;
    }
}

Archivo.prototype.equals = function (file) {
    return this.Key = file.Key;
};

/**
 * Metodo para cargar la informacion del archivo mediante un objeto
 * @method cargaDesdeObjeto
 * @param {{ReuseId : Number, ContadorPeticiones : Number}}DataPacket
 */
Archivo.prototype.cargaDesdeObjeto = function (DataPacket) {
    this.ReuseId = DataPacket["ReuseId"];
    this.ContadorPeticiones = DataPacket["ContadorPeticiones"];
    return this;
};
Archivo.prototype.setContador = function (contador) {
    this.ContadorPeticiones = contador;
};
Archivo.prototype.getContador = function () {
    return this.ContadorPeticiones;
};
/**
 * Metodo para aumentar el contador de peticiones
 * @method aumentaContador
 */
Archivo.prototype.aumentaContador = function () {
    this.ContadorPeticiones++;
};
/**
 * Metodo para asignar un id de reutilizacion de archivo
 * @method setReuseId
 * @param {Number} ReuseId
 */
Archivo.prototype.setReuseId = function (ReuseId) {
    this.ReuseId = ReuseId;
};
Archivo.prototype.getReuseId = function () {
    return this.ReuseId;
};
/**
 * Metodo para obtener el nombre del archivo
 * @method getFileName
 * @returns {string}
 */
Archivo.prototype.getFilename = function () {
    const list = this.Key.split('/');
    if (list.length !== 4) throw new Error("Existen una cantidad invalida de separadores en " + this.Key);
    return list[3];
};
/**
 * Metodo para obtener el nombre corto (sin numero de pagina ni extension) del archivo
 * @method getShortName
 * @returns {string}
 */
Archivo.prototype.getShortName = function () {
    const partesSeparadasPorGuion = this.getFilename().split('-');
    partesSeparadasPorGuion.pop();
    return partesSeparadasPorGuion.join('-');
};
Archivo.prototype.getPage = function () {
    const last = this.getFilename().split('-').pop();
    const dotIndex = last.lastIndexOf('.');
    const page = last.substring(0, dotIndex);
    const number = parseInt(page);
    if (!number) throw new Error('No se pudo encontrar numero de pagina, archivo: ' + this.getKey());
    return number;
};
/**
 * Metodo para obtener la extension del archivo
 * @method getExtension
 * @returns {string}
 */
Archivo.prototype.getExtension = function () {
    const last = this.getFilename().split('-').pop();
    const dotIndex = last.lastIndexOf('.') + 1;
    if (dotIndex === 0) throw new Error("El archivo no posee una extension en " + this.Key);
    return last.substr(dotIndex);
};
/**
 * Metodo para determinar si el nombre corto del archivo coincide con el del parametro, se utilizara para reconocer
 * las paginas de un mismo examen, util para filtrado
 * @param {String} Text
 * @returns {boolean}
 */
Archivo.prototype.matchesText = function (Text) {
    const expression = new RegExp(this.getShortName(), 'i');
    const expressionText = new RegExp(Text);
    const ownShortName = this.getShortName();
    if (expressionText.test(ownShortName)) return true;
    return (expression.test(Text));
};
/**
 * Metodo que retorna el tipo de archivo para su uso en Facebook
 * @method getType
 * @returns {String}
 */
Archivo.prototype.getType = function () {
    const extension = this.getExtension();
    const extensionesImagenes = ["jpg","png","jpeg","bmp"];
    if (extensionesImagenes.includes(extension))
        return 'image';
    const extensionesAudio = ["mp3","wav","wma","ogg"];
    if (extensionesAudio.includes(extension))
        return 'audio';
    const extensionesVideo = ["webm","avi","mp4","flv","3gp"];
    if (extensionesVideo.includes(extension))
        return 'video';
    return 'file';
};
Archivo.prototype.getKey = function () {
    return this.Key;
};

/**
 *
 * @returns {{ReuseId: Number, Carpeta: String, Facultad: String, Curso: String, Key: String,
 * ContadorPeticiones: Number}}
 */
Archivo.prototype.getData = function () {
    return {
        Key : this.Key,
        Curso : this.Curso,
        Facultad : this.Facultad,
        Carpeta : this.Carpeta,
        ReuseId : this.ReuseId,
        ContadorPeticiones : this.ContadorPeticiones
    }
};
Archivo.prototype.getUpdateData = function () {
    return {
        ReuseId : this.ReuseId,
        ContadorPeticiones : this.ContadorPeticiones
    }
};

module.exports = Archivo;