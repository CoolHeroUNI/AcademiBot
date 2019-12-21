const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");
const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");

module.exports = function crearCuentaPerfilMensajeria(idPerfil, t) {
  return cuenta_Mensajeria.create({}, { transaction: t })
    .then(cuenta => {
      return Usuario_CuentaMensajeria.create({
        codigo_perfil: idPerfil,
        codigo_cuenta: cuenta.get('id')
      }, { transaction: t })
    })
};
