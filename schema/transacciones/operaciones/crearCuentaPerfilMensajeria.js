const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");
const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");

module.exports = async function crearCuentaPerfilMensajeria(idUsuarioCanal, t) {
  const cuenta = await cuenta_Mensajeria.create({}, { transaction: t });
  return Usuario_CuentaMensajeria.create({
    codigo_usuario: idUsuarioCanal,
    codigo_cuenta: cuenta.get('id')
  }, { transaction: t });
};
