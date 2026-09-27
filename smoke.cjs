const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

const cards = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
assert.strictEqual(cards.length, 567, 'Native card catalog must be complete');
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
  const kinds = new Set();
  let newCount = 0, generalCount = 0;
  for (let i = 0; i < 150; i++) {
    vm.runInContext('generatePatch()', context);
    const zh = element('article-content').innerHTML;
    assert(zh.includes('先古之民') && zh.includes('敌人') && zh.includes('模组开发'));
    assert(!/undefined|\{[^}]+\}/.test(zh), 'Unresolved content in Chinese');
    samples.add(zh);
    vm.runInContext("setLanguage('en')", context);
    const en = element('article-content').innerHTML;
    assert(en.includes('Ancients') && en.includes('MODDING'));
    assert(!/undefined|\{[^}]+\}/.test(en), 'Unresolved content in English');
    vm.runInContext("setLanguage('zh')", context);
    const stats = vm.runInContext('({kinds:Object.values(patch.entries).flat().map(x=>x.kind), general:patch.general.length})', context);
    stats.kinds.forEach(kind => kinds.add(kind));
    newCount += stats.kinds.filter(kind => kind === 'new').length;
    generalCount += Number(stats.general > 0);
  }
  assert(samples.size > 140, 'Randomization is too repetitive');
  for (const kind of ['number','keyword','upgrade','baseOnly','rework']) assert(kinds.has(kind), `Missing ${kind} changes`);
  assert(newCount < 65, 'New cards are too common');
  assert(generalCount > 90, 'General changes are too rare');
  console.log(`150 bilingual generations passed; ${samples.size} unique posts; ${newCount} new cards; ${generalCount} general sections.`);
});
