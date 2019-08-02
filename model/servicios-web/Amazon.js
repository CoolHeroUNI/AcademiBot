const AWS = require('aws-sdk');
const Archivo = require('../universidad/archivos/Archivo');
/**
 * clase dedicada al manejo de la base de datos, obtencion
 * de archivos de configuracion para cargar los usuarios y
 * universidad, asi como los archivos, asi como guardarlos,
 * utiliza el modulo de aws-sdk, pero utiliza solo los
 * metodos necesarios y adaptados para el desarrollo de esta
 * aplicacion
 * @class Amazon
 * @constructor
 * @param {String} _accessKeyId clave de acceso
 * @param {String} _secretAccessKey clave secreta
 * @param {String} _region region del Bucket
 * @param {String} _nombre nombre del Bucket
 */
class Amazon {
  constructor(_accessKeyId, _secretAccessKey, _region, _nombre) {
    // noinspection UnnecessaryLocalVariableJS
    let S3 = new AWS.S3({
      accessKeyId: _accessKeyId,
      secretAccessKey: _secretAccessKey,  
      region: _region
    });
    /**
     * El objeto principal, interfaz entre el programa y
     * Amazon Web Services
     * @property {AWS.S3} s3
     */
    this.s3 = S3;
    /**
     * Nombre del bucket de amazon s3
     * @property {String}
     */
    this.bucketName = _nombre;
  }
}
/**
 * Metodo para la obtencion de url's pre-firmadas por 
 * Amazon, imprescindible para el envio de archivos.
 * @method firmaUrls
 * @param {Archivo[]} archivos
 * @param {Number} [tiempo]
 * @returns {{payload:{attachment_id:String,url:String}, extension:String, type:String}[]}
 */
Amazon.prototype.firmaUrls = function (archivos, tiempo) {
  // Tiempo que la Url estara activa (en segundos)
  tiempo = tiempo ? tiempo : 300;
  let respuesta = [];
  for (let archivo of archivos) {
    let extension = archivo.getExtension();
    if (!extension) continue;
    let params = {
      Bucket: this.bucketName,
      Key: archivo.getRuta(),
      Expires: tiempo
    };
    let type = archivo.getType();
    let payload = {
      attachment_id : "",
      url : ""
    };
    if (archivo.esReusable()) payload.attachment_id = archivo.getAttachmentId();
    else payload.url = this.s3.getSignedUrl('getObject',params);
    respuesta.push({payload, extension, type});
  }
  return respuesta;
};
/**
 * Metodo para listar todas las Keys bajo determinado prefijo
 * @method listaObjetos
 * @param {String} prefijo prefijo que sera usado en la busqueda
 * @param {String} [continuationToken] continuacion de ejecucion anterior
 * @param {String[]} [previo] resultados previos
 * @returns {Promise<String[]>}
 */
Amazon.prototype.listaObjetos = async function (prefijo, continuationToken, previo) {
  let resultado = [];
  let params = {
    Bucket:this.bucketName,
    EncodingType: 'url',
    MaxKeys:1000,
    Prefix: prefijo
  };
  if (continuationToken) {
    params.ContinuationToken = continuationToken;
    resultado = previo;
  }
  let respuesta = await this.s3.listObjectsV2(params).promise();
  // console.log(respuesta);
  for (let contenido of respuesta.Contents) {
    resultado.push(contenido.Key);
  }
  if (respuesta.IsTruncated) {
    return this.listaObjetos(prefijo, respuesta.ContinuationToken, resultado);
  }
  return resultado;
};
/**
 * Metodo para obtener los objetos directamente debajo del prefijo
 * y hasta la siguiente aparicion de '/', pueden ser subcarpetas o
 * archivos.
 * @method listaObjetosDirectamenteBajo
 * @param {String} prefijo
 * @param {String} [continuationToken]
 * @param {String[]} [previo]
 * @returns {String[]}
 */
Amazon.prototype.listaObjetosDirectamenteBajo = async function (prefijo, continuationToken, previo) {
  let resultado = [];
  let params = {
    Bucket:this.bucketName,
    EncodingType: 'url',
    MaxKeys:1000,
    Delimiter: '/',
    Prefix: prefijo
  };
  if (continuationToken) {
    params.ContinuationToken = continuationToken;
    resultado = previo;
  }
  let respuesta = await this.s3.listObjectsV2(params).promise();
  //console.log(respuesta);
  for (let key of respuesta.CommonPrefixes) {
    let prefijo = key.Prefix;
    // Quitar el ultimo caracter al prefijo que tiene la forma
    // siguiente: xx/ -> xx
    if (!~resultado.indexOf(prefijo)) {
      resultado.push(prefijo);
    }
  }
  if (respuesta.IsTruncated) {
    return this.listaObjetosDirectamenteBajo(prefijo, respuesta.ContinuationToken, resultado);
  }
  return resultado;
};
/**
 * Metodo para descargar un archivo dada su key (ruta),
 * no se valida, tener precaucion
 * @method getObject
 * @param {String} key
 * @returns {Buffer}
 */
Amazon.prototype.getObject = async function (key) {
  let param = {
    Bucket: this.bucketName,
    Key: key
  };
  let data = await this.s3.getObject(param).promise();
  return data.Body;
};
/**
 * Metodo para obtener un objeto tipo JSON desde un
 * archivo en S3, dada su key
 * @method getJSON
 * @param {String} key
 * @returns {Promise}
 */
Amazon.prototype.getJSON = async function (key) {
  let buffer = await this.getObject(key);
  return JSON.parse(buffer.toString());
};
/**
 * Metodo para subir archivos a una ruta especifica
 * @method putObject
 * @param {String} key
 * @param {Buffer|String|ReadableStream} cuerpo
 */
Amazon.prototype.putObject = function (key, cuerpo) {
  let param = {
    Body: cuerpo,
    Bucket: this.bucketName,
    Key: key
  };
  this.s3.putObject(param).promise()
    .catch(e => console.log(e));
};

/**
 * Metodo para mover un objeto dentro del mismo Bucket
 * @method moveObject
 * @param {String} origen
 * @param {String} destino
 * @returns {Promise<PromiseResult<S3.DeleteObjectOutput, AWSError> | void>}
 */
Amazon.prototype.moveObject = function (origen, destino) {
  let param = {
    Bucket: this.bucketName,
    CopySource: `/${this.bucketName}/${origen}`,
    Key: destino
  };
  return this.s3.copyObject(param).promise()
    .then(() => this.deleteObject(origen))
    .catch(e => console.log(e));
};
/**
 * Metodo para eliminar un Objeto en cierta ruta
 * @param {String} key
 * @returns {Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>>}
 */
Amazon.prototype.deleteObject = function (key) {
  let param = {
    Bucket : this.bucketName,
    Key : key
  };
  return this.s3.deleteObject(param).promise();
};
module.exports = Amazon;