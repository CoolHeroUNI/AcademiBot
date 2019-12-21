const cuentas = require("../schema/Cuentas");
const entidades = require("../schema/Entidades");
const relaciones = require("../schema/Relaciones");
const crearTodo = require("../schema/transacciones/crearTodo");
const canalMensajeria = require("../schema/Entidades/CanalMensajeria");

for (const entidad of entidades) {
  entidad.sync();
}
for (const cuenta of cuentas) {
  cuenta.sync();
}
for (const relacion of relaciones) {
  relacion.sync();
}
const nombre = "WHATSAPP";
canalMensajeria.create({ nombre })
  .then(() => crearTodo(nombre, "909984655"))
  .then(() => crearTodo(nombre, "646464665"));
