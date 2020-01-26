module.exports.creaUsuario = require('./creaUsuario');
module.exports.creaRecursos = require('./creaRecursos');
module.exports.mensajeTexto = require('./mensajeTexto');
module.exports.actualizarEnvio = require('./actualizarEnvio');
module.exports.actualizarInfoUsuario = require('./actualizarInfoUsuario');
module.exports.actualizarInfoRecurso = require('./actualizarInfoRecurso');
module.exports.batchRecursos = require('./batchRecursos');



/**
 *
 * @param recurso
 * @param canal
 * @param {{tipo_archivo:String, codigo_reutilizacion:String}} atributos
 */
/**async function crearRecursoCanal(recurso, canal, atributos) {
  const tipo_evento = await findTipo_evento('crea-recurso');
  const tipo_evento_id = tipo_evento.get('id');
  let error = null, duracion_en_ms = 0;
  try {
    duracion_en_ms = await associateResourceWithChannel(recurso, canal, atributos);
  } catch (e) {
    error = e;
  }
  await S.Evento.create({ tipo_evento_id, error, duracion_en_ms });
  if (error) throw error;
}**/

