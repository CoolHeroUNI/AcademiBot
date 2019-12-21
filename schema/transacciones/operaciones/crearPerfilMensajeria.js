const CanalMensajeria = require("../../Entidades/CanalMensajeria");
const Usuario_Canal = require("../../Relaciones/Usuario_Canal");

module.exports = async function crearPerfilMensajeria(idUsuario, nombreCanal, codigoIdentificador, t) {
  const canal = await CanalMensajeria.findOne({ where: { nombre: nombreCanal }, transaction: t });
  return Usuario_Canal.create({
    codigo_usuario: idUsuario,
    codigo_canal: canal.get('id'),
    codigo_identificador: codigoIdentificador
  }, { transaction: t });
};