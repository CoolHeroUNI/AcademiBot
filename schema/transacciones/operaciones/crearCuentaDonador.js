const cuenta_Donador = require("../../Cuentas/cuenta_Donador");
const Usuario_CuentaDonador = require("../../Relaciones/Usuario_CuentaDonador");

module.exports = async function crearCuentaDonador (idUsuario, t) {
  const cuenta = await cuenta_Donador.create({}, { transaction: t });
  return Usuario_CuentaDonador.create({
    codigo_usuario: idUsuario,
    codigo_cuenta: cuenta.get('id')
  }, { transaction: t });
};