const cuenta_Mensajeria = require("../../Cuentas/cuenta_Mensajeria");
const Usuario_CuentaMensajeria = require("../../Relaciones/Usuario_CuentaMensajeria");

module.exports = async function crearCuentaPerfilMensajeria(idPerfil, t) {
  const cuenta = await cuenta_Mensajeria.create({}, { transaction: t });
  return Usuario_CuentaMensajeria.create({
    codigo_perfil: idPerfil,
    codigo_cuenta: cuenta.get('id')
  }, { transaction: t });
};
