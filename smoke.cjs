const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const cards = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    id, innerHTML: '', textContent: '', disabled: false,
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {}, setAttribute() {}
  });
  return elements.get(id);
}
const context = vm.createContext({
  document: { getElementById: element, documentElement: {}, title: '' },
  window: { scrollTo() {} }, console,
  fetch: async () => ({ ok: true, json: async () => cards })
});
vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
setImmediate(() => {
  const samples = new Set();
  for (let i = 0; i < 150; i++) {
    vm.runInContext('generatePatch()', context);
    const zh = element('article-content').innerHTML;
    assert(zh.includes('远古生灵') && zh.includes('模组开发'));
    assert(!/undefined|\{[^}]+\}/.test(zh), 'Unresolved content in Chinese');
    samples.add(zh);
    vm.runInContext("setLanguage('en')", context);
    const en = element('article-content').innerHTML;
    assert(en.includes('Ancients') && en.includes('MODDING'));
    assert(!/undefined|\{[^}]+\}/.test(en), 'Unresolved content in English');
    vm.runInContext("setLanguage('zh')", context);
  }
  assert(samples.size > 140, 'Randomization is too repetitive');
  console.log('150 bilingual generations passed; ' + samples.size + ' unique posts.');
});
