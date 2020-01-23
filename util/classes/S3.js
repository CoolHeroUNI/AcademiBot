const AWS = require('aws-sdk');
const CacheHandler = require('./CacheHandler');
class S3{
    constructor(accessKey, secretKey, region, bucket, cacheTime) {
        this.s3 = new AWS.S3({
            accessKeyId : accessKey,
            secretAccessKey : secretKey,
            region : region
        });
        this.bucket = bucket;
        this.cache = new CacheHandler(cacheTime);
    }
}

/**
 *
 * @param prefix
 * @param [continuationToken]
 * @param [previusResult]
 * @returns {Promise<String[]>}
 */
S3.prototype.listObjectsUnder = async function (prefix, continuationToken, previusResult) {
    previusResult = previusResult || [];
    const params = {
        Bucket : this.bucket,
        EncodingType : 'url',
        Prefix : prefix
    };
    if (continuationToken) params['ContinuationToken'] = continuationToken;
    const respuesta = await this.s3.listObjectsV2(params).promise();
    const resultado = [...previusResult, ...respuesta.Contents.map(objeto => objeto.Key)];
    if (respuesta.IsTruncated) {
        return this.listObjectsUnder(prefix, respuesta.NextContinuationToken, resultado);
    } else {
        return resultado;
    }
};
/**
 *
 * @param prefix
 * @param [continuationToken]
 * @param [previusResult]
 * @returns {Promise<String[]>}
 */
S3.prototype.listObjectsDirectlyUnder = async function (prefix, continuationToken, previusResult) {
    previusResult = previusResult || [];
    const params = {
        Bucket : this.bucket,
        EncodingType : 'url',
        Prefix : prefix,
        Delimiter : '/'
    };
    if (continuationToken) params['ContinuationToken'] = continuationToken;
    const respuesta = await this.s3.listObjectsV2(params).promise();
    const resultado = [...previusResult, ...respuesta.CommonPrefixes.map(objeto => objeto.Prefix)]
        .filter((value, index, self) => self.indexOf(value) === index);
    if (respuesta.IsTruncated) {
        return this.listObjectsUnder(prefix, respuesta.NextContinuationToken, resultado);
    } else {
        return resultado;
    }
};
/**
 *
 * @param {String} prefix
 * @returns {Promise<String[]>}
 */
S3.prototype.listObjectsUnderCached = function (prefix) {
    const cached = this.cache.get(prefix);
    if (cached) return Promise.resolve(cached);
    return this.listObjectsUnder(prefix)
      .then(keys => {
          this.cache.set(prefix, keys);
          return keys;
      })
};
/**
 *
 * @param {String} prefix
 * @returns {Promise<String[]>}
 */
S3.prototype.listObjectsDirectlyUnderCached = function (prefix) {
    const cached = this.cache.get(prefix);
    if (cached) return Promise.resolve(cached);
    return this.listObjectsDirectlyUnder(prefix)
      .then(keys => {
          this.cache.set(prefix, keys);
          return keys;
      })
};
S3.prototype.getObject = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key
    };
    return this.s3.getObject(params).promise();
};
S3.prototype.putObject = function (key, parameters) {
    if (!parameters.hasOwnProperty('Body')) throw new Error("Parametro Body no encontrado.");
    const params = {
        Body : parameters['Body'],
        Bucket : this.bucket,
        Key : key
    };
    if (parameters.hasOwnProperty('ContentType')) params['ContentType'] = parameters['ContentType'];
    if (parameters.hasOwnProperty('ContentLength')) params['ContentLength'] = parameters['ContentLength'];
    return this.s3.putObject(params).promise();
};
S3.prototype.copyObject = function (from, to) {
    const params = {
        CopySource: `/${this.bucket}/${from}`,
        Bucket: this.bucket,
        Key: to
    };
    return this.s3.copyObject(params).promise();
};
S3.prototype.deleteObject = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key
    };
    return this.s3.deleteObject(params).promise();
};
S3.prototype.moveObject = function (from, to) {
    return this.copyObject(from, to)
        .then(() => this.deleteObject(from))
};
S3.prototype.renameObject = function (key, newName) {
    const lista = key.split('/');
    const fileName = lista[lista.length - 1];
    lista.pop();
    const extension = fileName.substr(fileName.lastIndexOf('.'));
    const newKey = lista.join('/') + '/' + newName + extension;
    return this.moveObject(key, newKey);
};
S3.prototype.getPublicURL = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key,
        Expires : 300
    };
    return this.s3.getSignedUrlPromise('getObject', params);
};



module.exports = S3;