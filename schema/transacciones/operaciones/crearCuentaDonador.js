const cuenta_Donador = require("../../Cuentas/cuenta_Donador");
const Usuario_CuentaDonador = require("../../Relaciones/Usuario_CuentaDonador");

module.exports = function crearCuentaDonador (idUsuario, t) {
  return cuenta_Donador.create({}, { transaction: t })
    .then(cuenta => {
      return Usuario_CuentaDonador.create({
        codigo_usuario: idUsuario,
        codigo_cuenta: cuenta.get('id')
      }, { transaction: t })
    })
};