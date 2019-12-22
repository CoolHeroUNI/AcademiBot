const cuenta_Estudiante = require("../../Cuentas/cuenta_Estudiante");
const Estudiante_Cuenta = require("../../Relaciones/Estudiante_Cuenta");

module.exports = async function (idEstudiante, t) {
  const cuenta = await cuenta_Estudiante.create({}, { transaction: t });
  return Estudiante_Cuenta.create({
    codigo_estudiante: idEstudiante,
    codigo_cuenta: cuenta.get('id')
  }, { transaction: t });
};