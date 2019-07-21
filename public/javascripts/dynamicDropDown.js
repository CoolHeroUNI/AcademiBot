function poblaCarpetas() {
  let j = 0;
  let curso = boxCurso.value;
  boxCarpeta.options.length = 0;
  for (let carpeta in directorio[curso]) {
    if (directorio[curso].hasOwnProperty(carpeta)) {
      boxCarpeta.options[j] = new Option(carpeta, carpeta);
      j++;
    }
  }
}
let material = document.getElementById("material");
let boxCurso = document.getElementById("curso");
let boxCarpeta = document.getElementById("carpeta");
let i = 0;
for (let curso in directorio) {
  if (directorio.hasOwnProperty(curso)) {
    boxCurso.options[i] = new Option(curso, curso);
    i++;
  }
}
poblaCarpetas();
boxCurso.onchange = poblaCarpetas;