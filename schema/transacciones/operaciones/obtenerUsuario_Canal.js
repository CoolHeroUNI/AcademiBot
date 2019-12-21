const Usuario_Canal = require("../../Relaciones/Usuario_Canal");
const CanalMensajeria = require("../../Entidades/CanalMensajeria");

module.exports = function obtenerUsuario_Canal(codigoIdentificador, nombreCanal, t) {
  return CanalMensajeria.findOne({ where: { nombre: nombreCanal }, transaction: t })
    .then(canal => Usuario_Canal.findOne(
      {
        where: { codigo_canal: canal.get('id'), codigo_identificador: codigoIdentificador },
        transaction: t
      }));
};