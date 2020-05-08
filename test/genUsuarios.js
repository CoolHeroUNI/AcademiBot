const usuarios = [];
for (let i = 0; i < 1000; i++) {
  let id = Math.floor(Math.random() * 9000000) + 1000000;
  id = id.toString();
  if (usuarios.find(u => u === id)) continue;
  usuarios.push(id);
}
module.exports = usuarios;