const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");
const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");

module.exports = async function obtenerCuentaMensajeria(codigoUsuario_Canal, t) {
  const relacion = await Usuario_CuentaMensajeria.findOne({
    where: { codigo_perfil: codigoUsuario_Canal },
    transaction: t
  });
  return cuenta_Mensajeria.findByPk(relacion.get('codigo_cuenta'), { transaction: t });
};