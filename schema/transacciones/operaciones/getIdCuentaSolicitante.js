const Usuario_CuentaSolicitante = require("../../Relaciones/Usuario_CuentaSolicitante");
const dbCache = require("../../../config/databaseCache");
module.exports = async function(idUsuario) {
  const cacheId = idUsuario + "-CuentaSolicitante";
  const idCuentaMensajeria = dbCache.get(cacheId);
  if (idCuentaMensajeria) return idCuentaMensajeria;
  const relacion = await Usuario_CuentaSolicitante.findOne({ where: { codigo_usuario: idUsuario }});
  const idCuenta = relacion.get('codigo_cuenta');
  dbCache.set(cacheId, idCuenta);
  return idCuenta;
};