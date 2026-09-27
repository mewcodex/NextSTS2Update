const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const cards = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
assert.strictEqual(cards.length, 567, 'Native card catalog must be complete');
const generator = fs.readFileSync('app.js', 'utf8');
assert(!/奥斯蒂|锻造次数|颗星星|引导 1 个闪电充能球|镀层|DoomPower: \['末日'/.test(generator), 'Outdated game terminology');
const elements = new Map();
const frames = [];
const fakeWindow = { scrollY: 0, scrollTo(options) { this.lastScroll = options; } };
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
  window: fakeWindow, requestAnimationFrame: callback => frames.push(callback), console,
  fetch: async () => ({ ok: true, json: async () => cards })
});
vm.runInContext(generator, context);
setImmediate(() => {
  const terms = vm.runInContext('({osty:labels.OstyDamage[0],summon:labels.Summon[0],forge:labels.Forge[0],stars:labels.Stars[0],doom:labels.DoomPower[0],plating:labels.PlatingPower[0]})', context);
  assert.strictEqual(terms.osty, '奥斯提伤害');
  assert.strictEqual(terms.summon, '召唤生命值');
  assert.strictEqual(terms.forge, '铸造数值');
  assert.strictEqual(terms.stars, '辉星');
  assert.strictEqual(terms.doom, '灾厄');
  assert.strictEqual(terms.plating, '覆甲');
  const powerFile = path.join(__dirname, '..', 'export', '111', 'localization', 'zhs', 'powers.json');
  if (fs.existsSync(powerFile)) {
    const officialPowers = JSON.parse(fs.readFileSync(powerFile, 'utf8'));
    const powerLabels = vm.runInContext('Object.fromEntries(Object.entries(labels).filter(([id]) => id.endsWith("Power")))', context);
    for (const [id, label] of Object.entries(powerLabels)) {
      const key = id.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase() + '.title';
      assert.strictEqual(label[0], officialPowers[key], `Incorrect game translation for ${id}`);
    }
  }
  assert.strictEqual(vm.runInContext("cleanDescription('{Stars:diff()}{singleStarIcon}', {vars:[{id:'Stars',base:2,up:3}]}, 'zh')", context), '2(3)点辉星');
  const samples = new Set();
  const kinds = new Set();
  let newCount = 0, generalCount = 0;
  for (let i = 0; i < 150; i++) {
    vm.runInContext('generatePatch()', context);
    const zh = element('article-content').innerHTML;
    assert(zh.includes('先古之民') && zh.includes('敌人') && zh.includes('模组开发'));
    assert(zh.includes('很可惜，并不是真的。'));
    assert.strictEqual(element('side-note').textContent, '很可惜，并不是真的。');
    assert(!/undefined|\{[^}]+\}/.test(zh), 'Unresolved content in Chinese');
    samples.add(zh);
    vm.runInContext("setLanguage('en')", context);
    const en = element('article-content').innerHTML;
    assert(en.includes('Ancients') && en.includes('MODDING'));
    assert(en.includes("Unfortunately, it isn&#39;t real."));
    assert.strictEqual(element('side-note').textContent, "Unfortunately, it isn't real.");
    assert(!/undefined|\{[^}]+\}/.test(en), 'Unresolved content in English');
    vm.runInContext("setLanguage('zh')", context);
    const stats = vm.runInContext('({kinds:Object.values(patch.entries).flat().map(x=>x.kind), general:patch.general.length, entries:patch.entries})', context);
    const descriptions = Object.values(stats.entries).flat().filter(entry => entry.thought).map(entry => entry.thought[0]);
    assert.strictEqual(new Set(descriptions).size, descriptions.length, 'Repeated card explanation');
    for (const entries of Object.values(stats.entries)) {
      assert(!entries.some((entry, index) => entry.thought && entries.slice(0, index).some(previous => !previous.thought)), 'Explained item must come first within its pool');
    }
    for (const entry of stats.entries.Colorless) {
      if (entry.thought) assert(!/这一角色|该角色|当前角色|this character/.test(entry.thought.join(' ')), 'Colorless treated as character');
    }
    assert(!/低\/高进阶|low\/high Ascension|未升级版本|升级版本|基础版本/.test(zh + en), 'Outdated patch phrasing');
    assert(!/从 \d|\d 点(?:伤害|格挡|生命)/.test(zh), 'Extra spaces in Chinese patch text');
    stats.kinds.forEach(kind => kinds.add(kind));
    newCount += stats.kinds.filter(kind => kind === 'new').length;
    generalCount += Number(stats.general > 0);
  }
  assert(samples.size > 140, 'Randomization is too repetitive');
  for (const kind of ['number','keyword','upgrade','baseOnly','rework']) assert(kinds.has(kind), `Missing ${kind} changes`);
  assert(newCount < 65, 'New cards are too common');
  assert(generalCount > 90, 'General changes are too rare');
  const enemyExamples = vm.runInContext('({both:enemyLine(enemyChanges[0]), high:enemyLine(enemyChanges[2])})', context);
  assert(enemyExamples.both.includes('14(18)') && !enemyExamples.both.includes('进阶'));
  assert(enemyExamples.high.includes('进阶8时') && enemyExamples.high.includes('24-28(26-30)'));
  assert(generator.includes("document.querySelector('.news-panel')") && generator.includes("panel.querySelector('.sidebar').style.display = 'none'"), 'Screenshot misses full article or sidebar exclusion');
  const before = vm.runInContext('patch', context);
  fakeWindow.scrollY = 300;
  vm.runInContext('smoothRegenerate()', context);
  assert.strictEqual(fakeWindow.lastScroll.behavior, 'smooth');
  frames.shift()();
  assert.strictEqual(vm.runInContext('patch', context), before, 'Article changed before scrolling finished');
  fakeWindow.scrollY = 0;
  frames.shift()();
  assert.notStrictEqual(vm.runInContext('patch', context), before, 'Article did not regenerate at the top');
  console.log(`150 bilingual generations passed; ${samples.size} unique posts; ${newCount} new cards; ${generalCount} general sections.`);
});
