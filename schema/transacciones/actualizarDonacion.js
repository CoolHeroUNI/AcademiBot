const { averageTime } = require("../../lib");
const cuenta_Donador = require("../Cuentas/cuenta_Donador");
const Historial_Donador = require("../Relaciones/Historial_Donador");
const Recurso = require("../Entidades/Recurso");
const sequelize = require("../../config/database");

module.exports = function (idCuenta, rutaRecurso) {
  return sequelize.transaction(async t => {
    const cuenta = await cuenta_Donador.findByPk(idCuenta, { transaction: t});
    const n = cuenta.get('total_recursos_donados');
    const nuevaHoraPromedio = averageTime(cuenta.get('hora_promedio_donaciones'), n);
    await cuenta.update({
      total_recursos_donados: n + 1,
      hora_promedio_donaciones: nuevaHoraPromedio
    }, { transaction: t });
    const extension = rutaRecurso.substr(rutaRecurso.lastIndexOf('.') + 1);
    const recurso = await Recurso.create({
      ruta: rutaRecurso,
      extension
    }, { transaction: t });
    await Historial_Donador.create({
      codigo_cuenta: idCuenta,
      codigo_recurso: recurso.get('id')
    }, { transaction: t });
  });
};
