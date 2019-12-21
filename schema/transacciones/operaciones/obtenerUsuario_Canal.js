const Usuario_Canal = require("../../Relaciones/Usuario_Canal");
const CanalMensajeria = require("../../Entidades/CanalMensajeria");

module.exports = async function obtenerUsuario_Canal(codigoIdentificador, nombreCanal, t) {
  const canal = await CanalMensajeria.findOne({ where: { nombre: nombreCanal }, transaction: t });
  return Usuario_Canal.findOne(
    {
      where: { codigo_canal: canal.get('id'), codigo_identificador: codigoIdentificador },
      transaction: t
    })
};