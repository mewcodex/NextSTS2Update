const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const cards = JSON.parse(fs.readFileSync('cards.json', 'utf8'));
assert.strictEqual(cards.length, 567, 'Native card catalog must be complete');
const generator = fs.readFileSync('app.js', 'utf8');
assert(fs.readFileSync('index.html', 'utf8').includes('STSAM'), 'Site brand must be STSAM');
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
  const banks = vm.runInContext('wordBanks', context);
  const draftFrames = vm.runInContext('draftFrames', context);
  for (const bank of Object.values(banks)) {
    for (const name of bank.names) {
      assert(!cards.some(card => card.en.toLowerCase() === name[1].toLowerCase() || card.zh === name[0]), `New card name already exists: ${name[1]}`);
    }
    for (const effect of bank.effects) {
      const upgrade = effect[0].match(/(\d+)\((\d+)\)/);
      assert(upgrade && Number(upgrade[2]) > Number(upgrade[1]), `New card has no stronger upgraded effect: ${effect[1]}`);
    }
  }
  for (const [pool, bank] of Object.entries(banks)) {
    assert.strictEqual(draftFrames[pool].length, bank.effects.length, `Missing drafted card frame for ${pool}`);
    for (const frame of draftFrames[pool]) {
      assert(['Attack', 'Skill', 'Power'].includes(frame.type) && frame.cost >= 0, `Invalid drafted card frame for ${pool}`);
    }
  }
  const relicFile = path.join(__dirname, '..', 'export', '111', 'localization', 'zhs', 'relics.json');
  const eventFile = path.join(__dirname, '..', 'export', '111', 'localization', 'zhs', 'events.json');
  if (fs.existsSync(relicFile) && fs.existsSync(eventFile)) {
    const relics = Object.values(JSON.parse(fs.readFileSync(relicFile, 'utf8')));
    const events = Object.values(JSON.parse(fs.readFileSync(eventFile, 'utf8')));
    for (const name of ['小邮箱','弹珠袋','摆动球','永冻冰晶']) assert(relics.includes(name), `Unknown relic translation: ${name}`);
    for (const name of ['蘑菇饥渴','欢迎来到旺购百货','打造时间']) assert(events.includes(name), `Unknown event translation: ${name}`);
  }
  const monsterFile = path.join(__dirname, '..', 'export', '111', 'localization', 'zhs', 'monsters.json');
  if (fs.existsSync(monsterFile)) {
    const monsters = JSON.parse(fs.readFileSync(monsterFile, 'utf8'));
    for (const [key, name] of Object.entries({
      'AXEBOT.moves.HAMMER_UPPERCUT.title':'上勾锤击',
      'AXEBOT.moves.ONE_TWO.title':'两连击',
      'AXEBOT.moves.SHARPEN.title':'打磨',
      'LOUSE_PROGENITOR.moves.CURL_AND_GROW.title':'蜷身成长',
      'SOUL_FYSH.moves.DE_GAS.title':'排气'
    })) assert.strictEqual(monsters[key], name, `Incorrect enemy move translation: ${key}`);
  }
  assert.strictEqual(vm.runInContext('ancientReferences[0].base', context), 999);
  assert.strictEqual(vm.runInContext("numericStep(999,-1,'Gold')", context), 888);
  const upgradeExhaustCandidates = [];
  for (let index = 0; index < cards.length; index++) {
    const options = vm.runInContext(`keywordOptions(catalog[${index}])`, context);
    const card = cards[index];
    for (const option of options) {
      if (option.scope === 'upgraded' && option.exhaust) {
        upgradeExhaustCandidates.push(card.en);
        assert(card.keywords.includes('Exhaust') && !card.upKeywords.includes('Exhaust'), 'Upgrade gained Exhaust without removing an existing upgrade benefit');
        assert(vm.runInContext(`hasIndependentUpgradeBenefit(catalog[${index}])`, context), 'Upgrade would become no stronger than base');
      }
      if (option.scope === 'both' && card.keywords.includes('Exhaust') !== card.upKeywords.includes('Exhaust'))
        assert(vm.runInContext(`hasIndependentUpgradeBenefit(catalog[${index}])`, context), 'Global keyword change erased the only upgrade benefit');
    }
  }
  assert.deepStrictEqual(upgradeExhaustCandidates.sort(), ['Graveblast', 'Hologram'], 'Upgrade Exhaust candidates changed without review');
  const samples = new Set();
  const kinds = new Set();
  let newCount = 0, generalCount = 0, extraCount = 0;
  for (let i = 0; i < 150; i++) {
    vm.runInContext('generatePatch()', context);
    const zh = element('article-content').innerHTML;
    assert(zh.includes('先古之民') && zh.includes('敌人') && zh.includes('模组开发'));
    assert(zh.includes('很可惜，并不是真的。'));
    assert.strictEqual(element('side-note').textContent, '很可惜，并不是真的。');
    assert(!/undefined|\{[^}]+\}/.test(zh), 'Unresolved content in Chinese');
    assert(zh.includes('<ul class="rework-details"><li>旧：') && zh.includes('</li><li>新：'), 'Chinese rework lacks old/new card details');
    samples.add(zh);
    vm.runInContext("setLanguage('en')", context);
    const en = element('article-content').innerHTML;
    assert(en.includes('Ancients') && en.includes('MODDING'));
    assert(en.includes("Unfortunately, it isn&#39;t real."));
    assert.strictEqual(element('side-note').textContent, "Unfortunately, it isn't real.");
    assert(!/undefined|\{[^}]+\}/.test(en), 'Unresolved content in English');
    assert(en.includes('<ul class="rework-details"><li>Old: ') && en.includes('</li><li>New: '), 'English rework lacks old/new card details');
    vm.runInContext("setLanguage('zh')", context);
    const stats = vm.runInContext('({kinds:Object.values(patch.entries).flat().map(x=>x.kind), general:patch.general.length, extra:patch.relics.length+patch.events.length+patch.writing.length, entries:patch.entries})', context);
    const descriptions = Object.values(stats.entries).flat().filter(entry => entry.thought).map(entry => entry.thought[0]);
    assert.strictEqual(new Set(descriptions).size, descriptions.length, 'Repeated card explanation');
    for (const entries of Object.values(stats.entries)) {
      assert(!entries.some((entry, index) => entry.thought && entries.slice(0, index).some(previous => !previous.thought)), 'Explained item must come first within its pool');
    }
    for (const entry of stats.entries.Colorless) {
      if (entry.thought) assert(!/这一角色|该角色|当前角色|this character/.test(entry.thought.join(' ')), 'Colorless treated as character');
    }
    for (const entry of Object.values(stats.entries).flat()) {
      if (entry.kind === 'rework') {
        const detail = vm.runInContext('lineFor', context)(entry);
        assert(/旧：[^<]+ - (攻击牌|技能牌) - 耗能\d+(?:\(\d+\))? - (普通|罕见|稀有) - “/.test(detail), 'Original rework card frame is missing');
        assert(/新：[^<]+ - (攻击牌|技能牌) - 耗能\d+(?:\(\d+\))? - (普通|罕见|稀有) - “/.test(detail), 'New rework card frame is missing');
        assert.strictEqual(entry.oldFrame.type, entry.card.type, 'Original rework type differs from catalog');
        assert.strictEqual(entry.oldFrame.rarity, entry.card.rarity, 'Original rework rarity differs from catalog');
        assert.strictEqual(entry.oldFrame.cost, entry.card.cost, 'Original rework cost differs from catalog');
        assert.strictEqual(entry.oldFrame.upCost, entry.card.upCost, 'Original rework upgrade cost differs from catalog');
        assert.strictEqual(entry.newFrame.type, entry.oldFrame.type, 'Rework effect must match its card type');
        assert(entry.newFrame.cost >= entry.newFrame.upCost && entry.newFrame.upCost >= 0, 'Reworked upgrade cost is invalid');
      }
      if (entry.kind === 'new') {
        assert(['Attack', 'Skill', 'Power'].includes(entry.frame.type) && entry.frame.cost >= 0, 'New card lacks its frame');
      }
      if (entry.kind === 'baseOnly') {
        const polarity = vm.runInContext('beneficialDirection', context)(entry.card, entry.variable);
        assert(polarity * (entry.variable.up - Number(entry.next)) > 0, 'Base-only change overtakes upgraded value');
      }
      if (entry.kind === 'upgrade') {
        const polarity = vm.runInContext('beneficialDirection', context)(entry.card, entry.variable);
        assert(polarity * (Number(entry.next) - entry.variable.base) > 0, 'Upgrade is weaker than base');
      }
      if (entry.kind === 'cost') {
        const values = pair => pair.includes('(') ? pair.match(/\d+/g).map(Number) : [Number(pair), Number(pair)];
        const [oldBase, oldUp] = values(entry.old);
        const [newBase, newUp] = values(entry.next);
        assert(newBase >= 0 && newUp >= 0 && newUp <= newBase && oldBase - oldUp === newBase - newUp,
          'Cost change weakened the upgraded version relative to base');
      }
    }
    assert(!/低\/高进阶|low\/high Ascension|未升级版本|升级版本|基础版本/.test(zh + en), 'Outdated patch phrasing');
    assert(!/从 \d|\d 点(?:伤害|格挡|生命)/.test(zh), 'Extra spaces in Chinese patch text');
    stats.kinds.forEach(kind => kinds.add(kind));
    newCount += stats.kinds.filter(kind => kind === 'new').length;
    generalCount += Number(stats.general > 0);
    extraCount += Number(stats.extra > 0);
  }
  assert(samples.size > 140, 'Randomization is too repetitive');
  for (const kind of ['number','keyword','upgrade','baseOnly','cost','rarity','rework']) assert(kinds.has(kind), `Missing ${kind} changes`);
  assert(newCount < 65, 'New cards are too common');
  assert(generalCount > 90, 'General changes are too rare');
  assert(extraCount > 100, 'Additional patch sections are too rare');
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
  console.log(`150 bilingual generations passed; ${samples.size} unique posts; ${newCount} new cards; ${generalCount} general sections; ${extraCount} expanded sections.`);
});
