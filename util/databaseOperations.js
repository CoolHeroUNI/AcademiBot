const {
  Canal_mensajeria,
  Ciclo,
  Cuenta,
  Curso,
  Elemento_malla_curricular,
  Especialidad,
  Evento,
  Facultad,
  Historial,
  Recurso,
  RecursoCanal_mensajeria,
  Recurso_info,
  Recurso_obtencion,
  Sistema_calificacion,
  Tipo_cuenta,
  Tipo_evento,
  Tipo_historial,
  Usuario,
  UsuarioCanal_mensajeria,
  Usuario_donacion,
  Usuario_info,
  Usuario_solicitud
} = require("../Schema");
const { Op } = require("sequelize");
const { findRecursos } = require("../Schema/Events/FasterOperations");
const dbCache = require("../cache");
const compare = require("./SorensenDice");

/**
 *
 * @param {String[]} arreglo
 * @param {String} mensaje
 * @param minimoLetras
 * @param umbral
 */
function comparaArregloDeTexto(arreglo, mensaje, minimoLetras = 0, umbral = 0.4) {
  mensaje = mensaje.removeTildesLower().replace(/ {2}/g, ' ');
  const coincidenciaExacta = arreglo.filter((v) => {
    return (new RegExp(RegExp.escape(mensaje), 'i')).test(v) || (new RegExp(v, 'i').test(mensaje));
  });
  if (coincidenciaExacta.length) return coincidenciaExacta;
  const palabras = mensaje.split(' ');
  const mensajeLargo = (minimoLetras > 0 ? palabras.filter(palabra => palabra.length >= minimoLetras) : palabras)
    .join(' ').removeTildesLower().toUpperCase();
  const comparator = (v1, v2) => (compare(v2.toUpperCase(), mensajeLargo) - compare(v1.toUpperCase(), mensajeLargo));
  return arreglo.sort(comparator).filter(v => compare(v.toUpperCase(), mensajeLargo) > umbral);
}



/**
 *
 * @param {Usuario} usuario
 * @param {String} mensaje
 * @returns {Promise<Curso[]>}
 */
async function detectaCursos(usuario, mensaje='') {
  const info = usuario.get('info');
  if (!info.puede_pedir_cursos()) return [];
  const especialidad_id = info.get('especialidad_id');
  const ciclo_id = info.get('ciclo_id');
  let searchString = "CURSOS" + especialidad_id + ciclo_id;
  let cursosMismoCiclo = dbCache.get(searchString);
  if (!cursosMismoCiclo) {
    cursosMismoCiclo = await Elemento_malla_curricular.findAll({
      where: { especialidad_id, ciclo_id  }, include: [{ model: Curso, as: 'curso' }]
    });
    dbCache.set(searchString,cursosMismoCiclo);
  }
  if (!mensaje) return cursosMismoCiclo.map(e => e.get('curso'));
  let resultado = comparaArregloDeTexto(cursosMismoCiclo.map(curso => curso.get('curso').get('nombre')), mensaje, 1)
    .map(nombre => cursosMismoCiclo.find(curso => curso.get('curso').get('nombre') === nombre).get('curso'));
  if (resultado.length === 1) return resultado;
  if (ciclo_id > 5) {
    searchString = "CURSOS" + especialidad_id + 11;
    let cursosOtrosCiclos = dbCache.get(searchString);
    if (!cursosOtrosCiclos) {
      cursosOtrosCiclos = await Elemento_malla_curricular.findAll({
        where: { especialidad_id, ciclo_id  }, include: [{ model: Curso, as: 'curso' }]
      });
      dbCache.set(searchString,cursosOtrosCiclos);
    }
    const result = comparaArregloDeTexto(cursosOtrosCiclos.map(curso => curso.get('curso').get('nombre')), mensaje, 1, 0.6)
      .map(nombre => cursosOtrosCiclos.find(curso => curso.get('curso').get('nombre') === nombre).get('curso'));
    if (result.length === 1) return result;
    resultado = resultado.concat(result);
  }
  const lLimit = ciclo_id - 3 < 1 ? 1 : ciclo_id - 3;
  const gLimit = ciclo_id + 3 > 10 ? 10 : ciclo_id + 3;
  searchString = "CURSOS" + especialidad_id + [lLimit, gLimit];
  let cursosOtros = dbCache.get(searchString);
  if (!cursosOtros) {
    cursosOtros = await Elemento_malla_curricular.findAll({
      where: { especialidad_id, ciclo_id: { [Op.gt]: lLimit, [Op.lt]: gLimit, [Op.ne]: ciclo_id }},
      include: [{ model: Curso, as: 'curso' }]
    });
    dbCache.set(searchString, cursosOtros);
  }
  const result2 = comparaArregloDeTexto(cursosOtros.map(curso => curso.get('curso').get('nombre')), mensaje, 1, 0.65)
    .map(nombre => cursosOtros.find(curso => curso.get('curso').get('nombre') === nombre).get('curso'));
  if (result2.length === 1) return result2;
  return resultado.concat(result2);
}

async function detectaCarpetas(usuario, mensaje = '') {
  const info = usuario.get('info');
  await info.reload();
  if (!info.puede_pedir_carpetas()) return [];
  const directory = info.get('ruta');
  let searchString = "RECURSOS" + directory;
  let recursos = dbCache.get(searchString);
  if (!recursos) {
    recursos = await findRecursos(usuario.get('canal').get('canal_mensajeria_id'), directory);
    dbCache.set(searchString, recursos);
  }
  const rutas = recursos.map(recurso => {
    let ruta = recurso.get('info').get('ruta');
    ruta = ruta.replace(directory, '');
    return  ruta.substring(0, ruta.indexOf('/'));
  });
  if (!mensaje) return Array.from((new Set(rutas)).values());
  return Array.from((new Set(rutas)).values()).filter(carpeta => {
    const expresion = new RegExp(carpeta.removeTildesLower().replace(/-/g, '(|-| )'), 'i');
    return expresion.test(mensaje.removeTildesLower());
  });
}

/**
 *
 * @param usuario
 * @param mensaje
 * @returns {Promise<Recurso[]>}
 */
async function detectaArchivos(usuario, mensaje = '') {
  const info = usuario.get('info');
  await info.reload();
  if (!info.puede_pedir_archivos()) return [];
  const directory = info.get('ruta');
  let searchString = "RECURSOS" + directory;
  let recursos = dbCache.get(searchString);
  if (!recursos) {
    recursos = await findRecursos(usuario.get('canal').get('canal_mensajeria_id'), directory);
    dbCache.set(searchString, recursos);
  }

  console.log(recursos);
  if (!mensaje) return recursos;
  return recursos.filter(recurso => recurso.get('info').matchesText(RegExp.escape(mensaje)));
}

module.exports = { detectaCursos, detectaCarpetas, detectaArchivos };
