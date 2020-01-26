const Canal_mensajeria = require("./Canal_mensajeria");
const Ciclo = require("./Ciclo");
const Cuenta = require("./Cuenta");
const Curso = require("./Curso");
const Elemento_malla_curricular = require("./Elemento_malla_curricular");
const Especialidad = require("./Especialidad");
const Evento = require("./Evento");
const Facultad = require("./Facultad");
const Historial = require("./Historial");
const Parametros = require("./Parametros");
const Recurso = require("./Recurso");
const RecursoCanal_mensajeria = require("./Recurso-Canal_mensajeria");
const Recurso_info = require("./Recurso_info");
const Recurso_obtencion = require("./Recurso_obtencion");
const Sistema_calificacion = require("./Sistema_calificacion");
const Tipo_cuenta = require("./Tipo_cuenta");
const Tipo_evento = require("./Tipo_evento");
const Tipo_historial = require("./Tipo_historial");
const Usuario = require("./Usuario");
const UsuarioCanal_mensajeria = require("./Usuario-Canal_mensajeria");
const Usuario_donacion = require("./Usuario_donacion");
const Usuario_info = require("./Usuario_info");
const Usuario_solicitud = require("./Usuario_solicitud");

Tipo_evento.hasMany(Evento, { as: 'evento', foreignKey: { name: 'tipo_evento_id' }});
Tipo_evento.hasMany(Tipo_historial, { as: 'historial', foreignKey: { name: 'tipo_evento_id' }});

Evento.belongsTo(Tipo_evento, { as: 'tipo', foreignKey: { name: 'tipo_evento_id' }});
Evento.hasMany(Historial, { as: 'historial', foreignKey: { name: 'evento_id' }});

Tipo_historial.hasMany(Historial, { as: 'historial', foreignKey: { name: 'tipo_historial_id' }});
Tipo_historial.belongsTo(Tipo_cuenta, { as: 'cuenta', foreignKey: { name: 'tipo_cuenta_id'}});
Tipo_historial.belongsTo(Tipo_evento, { as: 'evento', foreignKey: { name: 'tipo_evento_id' }});

Historial.belongsTo(Tipo_historial, { as: 'tipo', foreignKey: { name: 'tipo_historial_id' }});
Historial.belongsTo(Evento, { as: 'evento', foreignKey: { name: 'evento_id' }});
Historial.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'cuenta_id' }});

Tipo_cuenta.hasMany(Tipo_historial, { as: 'historial', foreignKey: { name: 'tipo_cuenta_id' }});
Tipo_cuenta.hasMany(Cuenta, { as: 'cuenta', foreignKey: { name: 'tipo_cuenta_id' }});

Cuenta.belongsTo(Tipo_cuenta, { as: 'tipo', foreignKey: { name: 'tipo_cuenta_id' }});
Cuenta.hasMany(Historial, { as: 'historial', foreignKey: { name: 'cuenta_id' }});

Facultad.hasMany(Especialidad, { as: 'especialidad', foreignKey: { name: 'facultad_id' }});

Sistema_calificacion.hasMany(Curso, { as: 'curso', foreignKey: { name: 'sistema_calificacion_id' }});

Curso.belongsTo(Sistema_calificacion, { as: 'sc', foreignKey: { name: 'sistema_calificacion_id' }});
Curso.hasMany(Elemento_malla_curricular, { as: 'malla', foreignKey: { name: 'curso_id'}});
Curso.hasMany(Usuario_info, { as: 'usuario', foreignKey: { name: 'curso_id' }});

Especialidad.belongsTo(Facultad, { as: 'facultad', foreignKey: { name: 'facultad_id' }});
Especialidad.hasMany(Elemento_malla_curricular, { as: 'malla', foreignKey: { name: 'especialidad_id' }});
Especialidad.hasMany(Usuario_info, { as: 'usuario', foreignKey: { name: 'especialidad_id' }});

Ciclo.hasMany(Elemento_malla_curricular, { as: 'malla', foreignKey: { name: 'ciclo_id' }});
Ciclo.hasMany(Usuario_info, { as: 'usuario', foreignKey: { name: 'ciclo_id' }});

Elemento_malla_curricular.belongsTo(Especialidad, { as: 'especialidad', foreignKey: { name: 'especialidad_id' }});
Elemento_malla_curricular.belongsTo(Ciclo, { as: 'ciclo', foreignKey: { name: 'ciclo_id' }});
Elemento_malla_curricular.belongsTo(Curso, { as: 'curso', foreignKey: { name: 'curso_id' }});

Usuario_info.belongsTo(Ciclo, { as: 'ciclo', foreignKey: { name: 'ciclo_id', allowNull: true }});
Usuario_info.belongsTo(Especialidad, { as: 'especialidad', foreignKey: { name: 'especialidad_id', allowNull: true }});
Usuario_info.belongsTo(Usuario, { as: 'usuario', foreignKey: { name: 'usuario_id' }});
Usuario_info.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});
Usuario_info.belongsTo(Curso, { as: 'curso', foreignKey: { name: 'curso_id', allowNull: true }});

Recurso.hasOne(Recurso_info, { as: 'info', foreignKey: { name: 'recurso_id' }});
Recurso.hasOne(Recurso_obtencion, { as: 'obtencion', foreignKey: { name: 'recurso_id' }});
Recurso.hasMany(RecursoCanal_mensajeria, { as: 'canal_mensajeria', foreignKey: { name: 'recurso_id' }});
Recurso.belongsTo(Usuario, { as: 'usuario', foreignKey: { name: 'usuario_id', allowNull: true }, onUpdate: 'CASCADE', onDelete: 'SET NULL' });

Recurso_info.belongsTo(Recurso, { as: 'recurso', foreignKey: { name: 'recurso_id' }});
Recurso_info.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

Recurso_obtencion.belongsTo(Recurso, { as: 'recurso', foreignKey: { name: 'recurso_id' }});
Recurso_obtencion.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

RecursoCanal_mensajeria.belongsTo(Recurso, { as: 'recurso', foreignKey: { name: 'recurso_id' }});
RecursoCanal_mensajeria.belongsTo(Canal_mensajeria, { as: 'canal_mensajeria', foreignKey: { name: 'canal_mensajeria_id' }});
RecursoCanal_mensajeria.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

Canal_mensajeria.hasMany(RecursoCanal_mensajeria, { as: 'recurso', foreignKey: { name: 'canal_mensajeria_id' }});
Canal_mensajeria.hasMany(UsuarioCanal_mensajeria, { as: 'usuario', foreignKey: { name: 'canal_mensajeria_id'}});

Usuario.hasMany(UsuarioCanal_mensajeria, { as: 'canal', foreignKey: { name: 'usuario_id' }});
Usuario.hasOne(Usuario_info, { as: 'info', foreignKey: { name: 'usuario_id' }});
Usuario.hasOne(Usuario_donacion, { as: 'donacion', foreignKey: { name: 'usuario_id' }});
Usuario.hasOne(Usuario_solicitud, { as: 'solicitud', foreignKey: { name: 'usuario_id' }});
Usuario.hasMany(Recurso, { as: 'recurso', foreignKey: { name: 'usuario_id', allowNull: true }});

UsuarioCanal_mensajeria.belongsTo(Usuario, { as: 'usuario', foreignKey: { name: 'usuario_id'}});
UsuarioCanal_mensajeria.belongsTo(Canal_mensajeria, { as: 'canal_mensajeria', foreignKey: { name: 'canal_mensajeria_id' }});
UsuarioCanal_mensajeria.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

Usuario_solicitud.belongsTo(Usuario, { as: 'usuario', foreignKey: { name: 'usuario_id' }});
Usuario_solicitud.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

Usuario_donacion.belongsTo(Usuario, { as: 'usuario', foreignKey: { name: 'usuario_id' }});
Usuario_donacion.belongsTo(Cuenta, { as: 'cuenta', foreignKey: { name: 'id' }});

module.exports = {
  Canal_mensajeria,
  Ciclo,
  Cuenta,
  Curso,
  Elemento_malla_curricular,
  Especialidad,
  Evento,
  Facultad,
  Historial,
  Parametros,
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
};