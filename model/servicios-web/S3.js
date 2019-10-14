const AWS = require('aws-sdk');
const Archivo = require('../universidad/archivos/Archivo');
AWS.config = new AWS.Config(  {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1"
});
/**
 * clase dedicada al manejo de la base de datos, obtencion
 * de archivos de configuracion para cargar los usuarios y
 * universidad, asi como los archivos, asi como guardarlos,
 * utiliza el modulo de aws-sdk, pero utiliza solo los
 * metodos necesarios y adaptados para el desarrollo de esta
 * aplicacion
 * @class S3
 * @constructor
 */
class S3 {
  constructor() {
    /**
     * El objeto principal, interfaz entre el programa y
     * S3 Web Services
     * @property {AWS.S3} s3
     */
    this.s3 = new AWS.S3();
    /**
     * Nombre del bucket de S3 s3
     * @property {String}
     */
    this.bucketName = process.env.S3_BUCKET_NAME;
  }
}
/**
 * Metodo para la obtencion de url's pre-firmadas por 
 * S3, imprescindible para el envio de archivos.
 * @method firmaUrls
 * @param {Archivo[]} archivos
 * @param {Number} [tiempo]
 * @returns {{payload:{attachment_id:String,url:String}, extension:String, type:String}[]}
 */
S3.prototype.firmaUrls = function (archivos, tiempo) {
  // Tiempo que la Url estara activa (en segundos)
  if (!tiempo) tiempo = 300;
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
    else payload.url = this.s3.getSignedUrl('getObject', params);
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
S3.prototype.listaObjetos = async function (prefijo, continuationToken, previo) {
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
    return this.listaObjetos(prefijo, respuesta.NextContinuationToken, resultado);
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
S3.prototype.listaObjetosDirectamenteBajo = async function (prefijo, continuationToken, previo) {
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
    return this.listaObjetosDirectamenteBajo(prefijo, respuesta.NextContinuationToken, resultado);
  }
  return resultado;
};
/**
 * Metodo para descargar un archivo dada su key (ruta),
 * no se valida, tener precaucion
 * @method getObject
 * @param {String} key
 * @returns {Promise<PromiseResult<S3.GetObjectOutput, AWSError>>}
 */
S3.prototype.getObject = function (key) {
  let param = {
    Bucket: this.bucketName,
    Key: key
  };
  return this.s3.getObject(param).promise();
};
/**
 * Metodo para obtener un objeto tipo JSON desde un
 * archivo en S3, dada su key
 * @method getJSON
 * @param {String} key
 * @returns {Promise}
 */
S3.prototype.getJSON = async function (key) {
  let data = await this.getObject(key);
  return JSON.parse(data.Body.toString());
};
/**
 * Metodo para subir archivos a una ruta especifica
 * @method putObject
 * @param {String} key
 * @param {Buffer|String|Readable|ReadableStream} cuerpo
 * @param {String} [mime] propiedad que indica content-type
 * @param {Number} [size] propiedad que indica el tamano
 * @returns {Promise<S3.PutObjectOutput>}
 */
S3.prototype.putObject = function (key, cuerpo, mime, size) {
  let param = {
    Body: cuerpo,
    Bucket: this.bucketName,
    Key: key
  };
  if (mime) {
    param.ContentType = mime;
  }
  if (size !== undefined) {
    param.ContentLength = size;
  }
  return this.s3.putObject(param).promise();
};

/**
 * Metodo para mover un objeto dentro del mismo Bucket
 * @method moveObject
 * @param {String} origen
 * @param {String} destino
 * @returns {Promise}
 */
S3.prototype.moveObject = function (origen, destino) {
  let param = {
    Bucket: this.bucketName,
    CopySource: `/${this.bucketName}/${origen}`,
    Key: destino
  };
  return this.s3.copyObject(param).promise();
};
/**
 * Metodo para eliminar un Objeto en cierta ruta
 * @param {String} key
 * @returns {Promise}
 */
S3.prototype.deleteObject = function (key) {
  let param = {
    Bucket : this.bucketName,
    Key : key
  };
  return this.s3.deleteObject(param).promise();
};

module.exports = S3;