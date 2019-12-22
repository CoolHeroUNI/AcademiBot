const Usuario_CuentaDonador = require("../../Relaciones/Usuario_CuentaDonador");
const dbCache = require("../../../config/databaseCache");
module.exports = async function(idUsuario) {
  const cacheId = idUsuario + "-CuentaDonador";
  const idCuentaMensajeria = dbCache.get(cacheId);
  if (idCuentaMensajeria) return idCuentaMensajeria;
  const relacion = await Usuario_CuentaDonador.findOne({ where: { codigo_usuario: idUsuario }});
  const idCuenta = relacion.get('codigo_cuenta');
  dbCache.set(cacheId, idCuenta);
  return idCuenta;
};