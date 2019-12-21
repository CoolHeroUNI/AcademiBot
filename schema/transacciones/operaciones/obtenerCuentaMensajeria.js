const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");
const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");

module.exports = function obtenerCuentaMensajeria(codigoUsuario_Canal, t) {
  return Usuario_CuentaMensajeria.findOne({
    where: { codigo_perfil: codigoUsuario_Canal },
    transaction: t
  })
    .then(relacion => cuenta_Mensajeria.findOne({
      where: { id: relacion.get('codigo_cuenta') },
      transaction: t
    }))
};