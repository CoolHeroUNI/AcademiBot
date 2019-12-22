const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");
const Usuario_Canal = require("../../Relaciones/Usuario_Canal");
const dbCache = require("../../../config/databaseCache");
module.exports = async function(idUsuario) {
  const cacheId = idUsuario + "-CuentaMensajeria";
  const idCuentaMensajeria = dbCache.get(cacheId);
  if (idCuentaMensajeria) return idCuentaMensajeria;
  const relacion = await Usuario_Canal.findOne({ where: { codigo_usuario: idUsuario }});
  const relacion2 = await Usuario_CuentaMensajeria.findOne({ where: { codigo_usuario: relacion.get('id') }});
  const idCuenta = relacion2.get('codigo_cuenta');
  dbCache.set(cacheId, idCuenta);
  return idCuenta;
};