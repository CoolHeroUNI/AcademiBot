const cuenta_Solicitante = require("../../Cuentas/cuenta_Solicitante");
const Usuario_CuentaSolicitante = require("../../Relaciones/Usuario_CuentaSolicitante");

module.exports = async function crearCuentaSolicitante (idUsuario, t) {
  const cuenta = await cuenta_Solicitante.create({}, { transaction: t });
  return Usuario_CuentaSolicitante.create({
    codigo_usuario: idUsuario,
    codigo_cuenta: cuenta.get('id')
  }, { transaction: t });
};