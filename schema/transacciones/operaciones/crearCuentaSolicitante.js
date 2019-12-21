const cuenta_Solicitante = require("../../Cuentas/cuenta_Solicitante");
const Usuario_CuentaSolicitante = require("../../Relaciones/Usuario_CuentaSolicitante");

module.exports = function crearCuentaSolicitante (idUsuario, t) {
  return cuenta_Solicitante.create({}, { transaction: t })
    .then(cuenta => {
      return Usuario_CuentaSolicitante.create({
        codigo_usuario: idUsuario,
        codigo_cuenta: cuenta.get('id')
      }, { transaction: t })
    })
};