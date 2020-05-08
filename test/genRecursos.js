const uuid = require("uuid");
const c1 = ['FB-401', 'CB-302', 'FB-405', 'CB-101','HS-101','HS-201'];
const c2 = ['1pc','2pc','3pc','4pc','5pc','examen-parcial','examen-final','examen-sustitutorio'];
const recursos = [];
for (let i = 0; i < 5000; i++) {
  const ruta = `${c1.random()}/${c2.random()}/${Math.floor(Math.random()*500)}.jpg`;
  if (recursos.find(r => r.ruta === ruta)) continue;
  const longitud_en_bytes = Math.random() * 18000000;
  const mime = 'image/jpg';
  const hash = uuid();
  if (recursos.find(r => r.hash === hash)) continue;
  const recurso = { ruta, longitud_en_bytes, mime, hash };
  recursos.push(recurso);
}
module.exports = recursos;