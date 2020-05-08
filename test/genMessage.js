const letters = 'abcdefghijklmnopqrstuvwxyz,.0123456789'.split('');
const words = [];
for (let i = 0; i < 5000; i++) {
  let word = '';
  let length = Math.floor(Math.random() * 100) + 5;
  while (length--) {
    word += letters.random();
  }
  words.push(word);
}
module.exports = words;
