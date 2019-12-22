const Usuario_Canal = require("../../Relaciones/Usuario_Canal");
const dbCache = require("../../../config/databaseCache");
const Canal = require("../../Entidades/CanalMensajeria");
module.exports = async function(codigoIdentificador, nombreCanal) {
  const cacheId = codigoIdentificador + nombreCanal;
  const cachedUserId = dbCache.get(cacheId);
  if (cachedUserId) return cachedUserId;
  const canal = await Canal.findOne({ where: { nombre: nombreCanal }});
  const relacion = await Usuario_Canal.findOne({ where: { codigo_canal: canal.get('id') }});
  const userId = relacion.get('codigo_usuario');
  dbCache.set(cacheId, userId);
  return userId;
};