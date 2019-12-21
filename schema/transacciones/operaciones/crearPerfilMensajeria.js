const CanalMensajeria = require("../../Entidades/CanalMensajeria");
const Usuario_Canal = require("../../Relaciones/Usuario_Canal");
/**
 *
 * @param idUsuario
 * @param nombreCanal
 * @param codigoIdentificador
 * @param t
 * @returns {Promise}
 */
module.exports = function crearPerfilMensajeria(idUsuario, nombreCanal, codigoIdentificador, t) {
  return CanalMensajeria.findOne({ where: { nombre: nombreCanal }, transaction: t })
    .then(canal => {
      return Usuario_Canal.create({
        codigo_usuario: idUsuario,
        codigo_canal: canal.get('id'),
        codigo_identificador: codigoIdentificador
      }, { transaction: t })
    })
};