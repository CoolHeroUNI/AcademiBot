function encuentraFacultad() {
  return facultades[boxFacultad.selectedIndex];
}

function poblaCarpetas() {
  const directorio = encuentraFacultad().directorio;
  boxCarpeta.options.length = 0;
  const carpetas = Object.getOwnPropertyNames(directorio[boxCurso.value]);
  for (let i = 0; i < carpetas.length; i++) {
    boxCarpeta.options[i] = new Option(carpetas[i], carpetas[i]);
  }
}

function poblaCursos() {
  const directorio = Object.getOwnPropertyNames(encuentraFacultad().directorio);
  boxCurso.options.length = 0;
  for (let i = 0; i < directorio.length; i++) {
    boxCurso.options[i] = new Option(directorio[i], directorio[i]);
  }
  poblaCarpetas();
}
let material = document.getElementById("material");
let boxCurso = document.getElementById("curso");
let boxCarpeta = document.getElementById("carpeta");
let boxFacultad = document.getElementById("facultad");


for (let i = 0; i < facultades.length; i++) {
  const facultad = facultades[i];
  boxFacultad.options[i] = new Option(facultad.id, facultad.id);
}
poblaCursos();
boxCurso.onchange = poblaCarpetas;
boxFacultad.onchange = poblaCursos;