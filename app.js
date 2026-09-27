/* All copy and balance changes are assembled locally; no model or network call runs on generation. */
const $ = id => document.getElementById(id);
const pick = values => values[Math.floor(Math.random() * values.length)];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = values => [...values].sort(() => Math.random() - 0.5);
let language = 'zh';
let catalog = [];
let world = null;
let patch = null;
let liked = false;
let disliked = false;
let previewImageUrl = null;

const pools = ['Ironclad', 'Silent', 'Regent', 'Necrobinder', 'Defect', 'Colorless'];
const poolNames = {
  Ironclad: ['铁甲战士', 'Ironclad'], Silent: ['静默猎手', 'Silent'],
  Regent: ['储君', 'Regent'], Necrobinder: ['亡灵契约师', 'Necrobinder'],
  Defect: ['故障机器人', 'Defect'], Colorless: ['无色卡牌', 'Colorless Cards']
};
const ui = {
  generate: ['生成更新', 'Generate patch'], again: ['重新生成', 'Generate again'],
  type: ['小型更新/补丁说明', 'Small Update / Patch Notes'], date: ['2026 年 9 月 27 日', 'Sep 27, 2026'],
  store: ['商店', 'STORE'], community: ['社区', 'COMMUNITY'], about: ['关于', 'ABOUT'],
  support: ['客服', 'SUPPORT'], crumbCommunity: ['所有活动', 'All Events'],
  news: ['活动', 'Events'], gameLabel: ['游戏', 'GAME'],
  dateLabel: ['发布于', 'POSTED'], typeLabel: ['类型', 'TYPE'],
  controls: ['再来一次？', 'ANOTHER ONE?'],
  sideNote: ['很可惜，并不是真的。', "Unfortunately, it isn't real."],
  like: ['赞', 'Like'], comment: ['讨论', 'Discuss'], share: ['下载截图', 'Download image'],
  preview: ['查看截图', 'View image'], previewHint: ['长按图片可保存', 'Long press the image to save'],
  previewSave: ['下载图片', 'Download image'], previewClose: ['关闭', 'Close'],
  dislike: ['踩', 'Dislike'], copied: ['已保存', 'Saved'],
  content: ['内容与平衡：', 'CONTENT & BALANCE:'], ux: ['用户体验与界面：', 'USER EXPERIENCE & INTERFACE:'],
  bugs: ['漏洞修复：', 'BUG FIXES:'], modding: ['模组制作：', 'MODDING:'],
  general: ['通用', 'General'], enemies: ['敌人', 'Enemies'], multiplayer: ['多人游戏', 'Multiplayer'],
  relics: ['遗物', 'Relics'], events: ['事件', 'Events'], writing: ['文本：', 'WRITING:'],
  localization: ['本地化：', 'LOCALIZATION:']
};
function compactZh(value) {
  return String(value).replace(/([\p{Script=Han}])\s+(?=[\d(（])/gu, '$1')
    .replace(/([\d)）])\s+(?=[\p{Script=Han}])/gu, '$1')
    .replace(/([\p{Script=Han}])\s+(?=[，。；：！？])/gu, '$1');
}
const tr = pair => language === 'zh' ? compactZh(pair[0]) : pair[1];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const intros = [
  ['又到了 Beta 更新的时候，爬塔者们！这次有卡牌重做、一些平衡性调整，以及不少难以复现的漏洞修复。', 'Time for another beta patch, Slayers! We have a card rework, a round of balance changes, and fixes for a few tricky issues.'],
  ['假期结束，我们回来了！团队已经重新投入开发。这次补丁以平衡性调整和漏洞修复为主，后续更大的内容还需要一点时间。', 'We’re back from our break! The team is hard at work again. This patch focuses on balance and bug fixes; the bigger things we’ve been working on need a little more time.'],
  ['又一个 Beta 补丁来了！本次有卡牌重做、一些数值调整，以及一长串只有在非常具体的情况下才会遇到的修复。', 'Another beta patch is here! There’s a card rework, a handful of number adjustments, and a long list of fixes for very specific situations.'],
  ['嘿，爬塔者们！我们还在尝试让更多构筑有机会发挥，所以这次既有小幅增强，也有几处需要再观察的改动。', 'Hey Slayers! We’re still experimenting with ways to give more builds room to shine, so this patch includes some small buffs and a few changes we’ll be watching closely.'],
  ['这次的更新说明比上次短一些，但还是有不少值得测试的改动。如果哪项调整在实际对局中与预期不同，请务必告诉我们！', 'These notes are a little shorter than last time, but there’s still plenty to test. If a change feels different in an actual run than you expected, please let us know!'],
  ['新的 Beta 更新现已推出！这轮主要是根据近期反馈做一些细致调整，顺手处理了几处战斗顺序问题。', 'A new beta update is live! This pass makes a few targeted changes based on recent feedback and clears up some combat ordering issues along the way.'],
  ['爬塔者们，我们听到了你们对部分卡牌的反馈。今天的更新会给一些旧面孔新的用途，也会让少数表现过强的数值稍微收敛。', 'Slayers, we’ve heard your feedback on a few cards. Today’s update gives some familiar faces new jobs and brings a few overperforming numbers back down.'],
  ['假期过后，我们一直在测试之前月报提到的几项大型内容。它们还需要更多时间，所以先送上一份新的 Beta 补丁！', 'Since returning from our break, we’ve been testing some of the bigger additions mentioned in the Neowsletter. Those need more time, so here’s a fresh beta patch in the meantime!'],
  ['是时候再来一次实验性平衡更新了。Beta 分支的东西总有可能再变，所以请继续用游戏内反馈工具告诉我们你的体验。', 'It’s time for another experimental balance pass. Things on the beta branch can always change again, so please keep telling us how these feel through the in-game feedback tool.'],
  ['这次我们把重点放在那些“几乎可用”的牌上。一两个数值有时足以改变它们在牌组里的位置，看看这轮会发生什么吧。', 'This time we’re focusing on cards that have felt almost there. A number or two can change where they fit into a deck, so let’s see what this pass does.'],
  ['大家好！本次 Beta 更新包括卡牌调整、界面上的几处便利改进，还有一些我们在复查近期报告时发现的修复。', 'Hi everyone! This beta update includes card adjustments, a few interface conveniences, and fixes we found while revisiting recent reports.'],
  ['塔里的工作仍在继续。本轮更新没有巨大的系统改动，但有不少小地方值得仔细看看。', 'Work on the Spire continues. There’s no huge systems change in this round, but quite a few smaller details are worth a closer look.'],
  ['这次带来了一批卡牌平衡性调整，以及一些界面和体验改进。月报里提到的内容仍在制作中，感谢大家继续测试 Beta 分支！', 'This patch brings another batch of card balance changes, along with some interface and quality-of-life improvements. We’re still working on the things mentioned in the Neowsletter; thanks for continuing to test the beta!']
];
const bridges = [
  ['下面来看看本次更新的详细内容！', 'On with the rest of the patch notes!'],
  ['照例，欢迎继续向我们发送反馈。下面进入更新详情！', 'As always, please keep the feedback coming. On to the details!'],
  ['我们会继续关注这些改动的表现。现在进入更新详情！', 'We’ll keep an eye on how these changes play out. Now, on to the details!']
];
const endings = [
  ['感谢大家继续测试 Beta 分支，我们会留意反馈！', 'Thanks for continuing to test the beta branch. We’ll be reading your feedback!'],
  ['祝你爬塔顺利，下次更新见！', 'Good luck climbing, and we’ll see you in the next update!'],
  ['请继续通过游戏内反馈工具告诉我们你的想法。', 'Please keep sharing your thoughts through the in-game feedback tool.']
];
const labels = {
  Damage: ['伤害', 'damage'], CalculatedDamage: ['伤害', 'damage'], ExtraDamage: ['额外伤害', 'bonus damage'],
  Block: ['格挡', 'Block'], ExtraBlock: ['额外格挡', 'bonus Block'],
  Cards: ['卡牌数量', 'card count'], Draw: ['抽牌数', 'cards drawn'], Gold: ['金币', 'Gold'],
  Energy: ['能量', 'Energy'], HpLoss: ['生命损失', 'HP loss'], Heal: ['回复量', 'healing'],
  PoisonPower: ['中毒', 'Poison'], VulnerablePower: ['易伤', 'Vulnerable'],
  WeakPower: ['虚弱', 'Weak'], StrengthPower: ['力量', 'Strength'],
  DexterityPower: ['敏捷', 'Dexterity'], FocusPower: ['集中', 'Focus'],
  VigorPower: ['活力', 'Vigor'], PlatingPower: ['覆甲', 'Plating'],
  DoomPower: ['灾厄', 'Doom'], Stars: ['辉星', 'Stars']
};
Object.assign(labels, {
  Repeat: ['效果次数', 'repetitions'], Forge: ['铸造值', 'Forge'],
  OstyDamage: ['奥斯提造成的伤害', 'Osty damage'], Summon: ['召唤生命值', 'Summon HP'],
  Shivs: ['小刀数量', 'Shivs'], BlockNextTurn: ['下回合格挡', 'next-turn Block'],
  MaxHp: ['最大生命值', 'Max HP'], PanacheDamage: ['伤害', 'damage'],
  BombDamage: ['伤害', 'damage'], BlockOnExhaust: ['格挡', 'Block']
});
const wordBanks = {
  Ironclad: { names: [['余烬契约', 'Ember Pact'], ['裂甲冲锋', 'Sunder Charge'], ['血铸号令', 'Bloodforged Order']] },
  Silent: { names: [['薄雾陷阱', 'Mist Trap'], ['回声毒刃', 'Echoing Fang'], ['暗影佯攻', 'Umbral Feint']] },
  Regent: { names: [['星轨校准', 'Stellar Alignment'], ['王权余辉', 'Royal Afterglow'], ['日冕敕令', 'Corona Decree']] },
  Necrobinder: { names: [['灰骨回响', 'Ashbone Echo'], ['亡者借力', 'Borrowed Bones'], ['墓园圣歌', 'Grave Canticle']] },
  Defect: { names: [['电弧缓存', 'Arc Cache'], ['棱镜散射', 'Prism Scatter'], ['过载协议', 'Overload Protocol']] },
  Colorless: { names: [['临时同盟', 'Temporary Alliance'], ['空白契约', 'Blank Contract'], ['奇巧装置', 'Curious Device']] }
};
// Each drafted effect has a fixed card frame, so reworks and new cards can show
// the same type and cost details as the original patch notes.
const draftFrames = {
  Ironclad: [{ type: 'Skill', cost: 1 }, { type: 'Attack', cost: 2 }, { type: 'Skill', cost: 1 }],
  Silent: [{ type: 'Skill', cost: 1 }, { type: 'Attack', cost: 1 }, { type: 'Skill', cost: 1 }],
  Regent: [{ type: 'Skill', cost: 1 }, { type: 'Attack', cost: 2 }, { type: 'Skill', cost: 1 }],
  Necrobinder: [{ type: 'Attack', cost: 1 }, { type: 'Skill', cost: 1 }, { type: 'Skill', cost: 1 }],
  Defect: [{ type: 'Attack', cost: 1 }, { type: 'Skill', cost: 1 }, { type: 'Power', cost: 1 }],
  Colorless: [{ type: 'Skill', cost: 1 }, { type: 'Skill', cost: 1 }, { type: 'Skill', cost: 1 }]
};
const ancientReferences = [
  { name: "Nonupeipe's Signet Ring", zh: '诺奴佩普的图章戒指', type: 'relic', stat: ['金币', 'Gold'], base: 888, direction: -1, benefit: true },
  { name: "Tezcatara's Brightest Flame", zh: '特兹卡塔拉的至亮之焰', type: 'card', stat: ['最大生命值损失', 'Max HP loss'], base: 2, benefit: false },
  { name: "Pael's Relax", zh: '佩尔的放松', type: 'card', stat: ['格挡', 'Block'], base: 16, up: 18, benefit: true }
];
const enemyChanges = [
  {name:['巨斧机器人','Axebot'], move:['打磨','Sharpen'], kind:'intent', text:['“打磨”现在会同时获得格挡，意图由增益改为防御＋增益。','Sharpen now also gains Block, changing its intent from Buff to Defend + Buff.']},
  {name:['虱虫之祖','Louse Progenitor'], move:['蜷身成长','Curl and Grow'], kind:'intent', text:['“蜷身成长”不再获得格挡，意图由防御＋增益改为增益。','Curl and Grow no longer gains Block, changing its intent from Defend + Buff to Buff.']},
  {name:['灵魂异鱼','Soul Fysh'], move:['凝视','Gaze'], kind:'intent', text:['“凝视”现在会造成少量伤害，意图由负面效果改为攻击＋负面效果。','Gaze now deals a small amount of damage, changing its intent from Debuff to Attack + Debuff.']}
];
const eventChanges = [
  ['加强了蘑菇饥渴事件：“芳香蘑菇”选项升级的卡牌数量从2张提升至3张。', 'Buffed Hungry for Mushrooms event: the Fragrant Mushroom option now upgrades 3 cards instead of 2.'],
  ['修改了欢迎来到旺购百货事件：“旺购的神秘盲盒”现在也会在精英战斗后推进计数。', "Changed Welcome to Wongo's event: the Mystery Box now also progresses after Elite combats."],
  ['修改了打造时间事件：“混沌”选项生成的牌现在会更明确地标明本回合可以免费打出。', 'Changed Tinker Time event: cards created by the Chaos option now more clearly indicate that they are free to play this turn.']
];
const writingLines = [
  ['统一了部分临时免费打出效果的描述，以便与“本回合耗能变为0”区分。', 'Clarified several temporary free-to-play descriptions to distinguish them from setting a card’s cost to 0 for the turn.'],
  ['调整了部分升级后卡牌描述中的换行位置。', 'Adjusted line breaks in some upgraded card descriptions.'],
  ['更新了部分遗物的悬停说明，使触发时机更明确。', 'Updated a few relic tooltips to clarify when their effects trigger.']
];
const localizationLines = [
  ['修正了部分敌人意图说明中的中文标点。', 'Corrected Chinese punctuation in a few enemy intent descriptions.'],
  ['更新了多种语言的翻译文本。', 'Updated translations in several languages.'],
  ['修复了少数卡牌预览中未翻译的关键词。', 'Fixed a few untranslated keywords in card previews.']
];
const bugs = [
  [['修复了在多人游戏中，一名玩家打出来自另一名角色的牌，同时队友结束回合时，某些效果偶尔会结算两次的问题。', 'Fixed some effects occasionally resolving twice in multiplayer when a player used another character’s card as a teammate ended their turn.']],
  [['战斗结束时尚未结算的效果现在不会在特定条件下影响下一场战斗。', 'Effects still pending when combat ends no longer carry into the next combat under certain conditions.']],
  [['使用手柄快速切换奖励选项时，描述文字现在会正确更新。', 'Reward descriptions now update correctly when switching quickly between choices on controller.']],
  [['修复了在同一回合中连续生成并消耗一张牌时，战斗记录可能显示错误顺序的问题。', 'Fixed the combat log sometimes showing the wrong order when a card was created and Exhausted in the same turn.']],
  [['临时耗能变化与升级同时发生时，卡牌预览现在会正确刷新。', 'Card previews now refresh correctly when temporary cost changes and upgrades happen together.']],
  [['队友断线重连后，地图投票状态不再偶尔失去同步。', 'Map vote state no longer occasionally desynchronizes after a teammate reconnects.']],
  [['修复了特定敌人的多段攻击在目标于攻击中途死亡时仍显示额外命中数字的问题。', 'Fixed an extra hit number appearing when the target of a certain multi-hit enemy attack died partway through the move.']],
  [['修复了查看另一名玩家的牌组时，部分关键词说明可能沿用上一张牌的问题。', 'Fixed some keyword tooltips using text from the previous card when viewing another player’s deck.']],
  [['修复了在暂停菜单打开的瞬间切换窗口焦点时，少数输入提示可能消失的问题。', 'Fixed some input prompts disappearing when window focus changed as the pause menu opened.']],
  [['修复了一个只会在生成卡牌、复制卡牌与回合结束效果同一帧发生时出现的结算顺序问题。', 'Fixed an ordering issue that could occur when card creation, card copying, and an end-of-turn effect happened on the same frame.']],
  [['修复了部分遗物效果在以非通常方式获得临时能量后，数字预览延迟更新的问题。', 'Fixed some relic number previews updating late after temporary Energy was gained in an unusual way.']],
  [['修复了在超宽屏下，某些确认弹窗的焦点会落到不可见按钮上的问题。', 'Fixed focus landing on an invisible button in some confirmation dialogs at ultrawide resolutions.']]
];
const bugCategories = ['multiplayer', 'general', 'general', 'general', 'general', 'multiplayer',
  'enemies', 'multiplayer', 'general', 'general', 'general', 'general'];
const uxLines = [
  ['调整了长卡牌描述在较窄窗口中的换行方式。', 'Adjusted wrapping for long card descriptions in narrow windows.'],
  ['在查看队友牌组时，当前选中的卡牌现在会更清楚地突出显示。', 'The selected card is now highlighted more clearly when viewing a teammate’s deck.'],
  ['改善了使用控制器打开地图时的初始焦点位置。', 'Improved initial focus placement when opening the map with a controller.'],
  ['更新了部分关键词说明的排序，让相关效果更容易查找。', 'Updated the ordering of some keyword tooltips to make related effects easier to find.'],
  ['降低了频繁打开卡牌预览时的短暂卡顿。', 'Reduced brief stutters when opening card previews repeatedly.'],
  ['战斗记录现在会更一致地标注由其他玩家触发的效果。', 'The combat log now labels effects triggered by other players more consistently.']
];
const modLines = [
  ['改善了模组加载失败时的错误信息。', 'Improved error messages when a mod fails to load.'],
  ['为自定义卡牌描述的部分动态数值增加了更一致的刷新时机。', 'Made refresh timing more consistent for some dynamic values in custom card descriptions.'],
  ['减少了重新加载带有大量自定义卡牌的模组时的重复资源检查。', 'Reduced duplicate resource checks when reloading mods with many custom cards.'],
  ['调整了模组注册内容的诊断日志，让缺失的本地化键更容易定位。', 'Adjusted mod registration diagnostics to make missing localization keys easier to locate.'],
  ['改善了多个模组同时扩展卡牌池时的加载顺序稳定性。', 'Improved load order stability when several mods extend card pools at once.']
];

function numericStep(n, direction, kind) {
  if (/^([1-9])\1\1+$/.test(String(n))) return Math.max(1, n + direction * Number('1'.repeat(String(n).length)));
  if (n >= 100 && n % 100 === 0) return Math.max(1, n + direction * 100);
  if (n >= 50 && n % 10 === 0) return Math.max(1, n + direction * 10);
  const step = n >= 25 ? pick([2, 3, 4]) : n >= 12 ? pick([1, 2]) : 1;
  if (kind === 'Energy' || kind === 'Cards' || kind === 'Gold') return Math.max(1, n + direction * (n >= 20 ? 5 : 1));
  return Math.max(1, n + direction * step);
}
function valuePair(base, up) { return base === up ? String(base) : base + '(' + up + ')'; }
function candidateVars(card) {
  return card.vars.filter(v => v.base > 0 && v.base < 10000 && v.base !== null &&
    !['CalculationBase', 'CalculatedDamage'].includes(v.kind) &&
    (card.descEn.includes('{' + v.id + ':') || card.descZh.includes('{' + v.id + ':')) &&
    (v.kind !== 'Energy' || /获得\s*$/.test(card.descZh.replace(/\[\/?[a-zA-Z]+\]/g, '').split('{' + v.id + ':')[0])) &&
    Boolean(labels[v.id] || labels[v.kind]) && !/^(If|Condition|Chance)/.test(v.id) &&
    !(v.id === 'Cards' && /(?:大于等于|at least)\s*\{Cards:/i.test(card.descZh + card.descEn)));
}
function variableLabel(card, variable) {
  const description = card.descZh.replace(/\[\/?[a-zA-Z]+\]/g, '');
  if (variable.kind === 'Energy') return ['获得的能量', 'Energy gain'];
  if (variable.id === 'Cards') {
    if (/抽\s*\{Cards:/.test(description)) return ['抽牌数', 'cards drawn'];
    if (/丢弃\s*\{Cards:/.test(description)) return ['弃牌数', 'cards discarded'];
    if (/\{Cards:[^}]+\}张小刀/.test(description)) return ['小刀数量', 'Shivs'];
    if (/\{Cards:[^}]+\}张灵魂/.test(description)) return ['灵魂数量', 'Souls'];
  }
  if (variable.id === 'Repeat') {
    if (/\{Repeat:[^}]+\}个充能球栏位/.test(description)) return ['充能球栏位数', 'Orb slots'];
    if (/生成\s*\{Repeat:/.test(description)) return ['生成的充能球数量', 'Orbs channeled'];
    if (/激发[^。\n]*\{Repeat:/.test(description)) return ['激发次数', 'Evokes'];
    if (/中毒\s*\{Repeat:/.test(description)) return ['中毒施加次数', 'Poison applications'];
    if (/格挡\s*\{Repeat:/.test(description)) return ['格挡次数', 'Block gains'];
    if (/伤害\s*\{Repeat:/.test(description) || /攻击\s*\{Repeat:/.test(description)) return ['攻击次数', 'hits'];
  }
  return labels[variable.id] || labels[variable.kind];
}
function beneficialDirection(card, variable) {
  const marker = '{' + variable.id + ':';
  const before = card.descZh.split(marker)[0].replace(/\[\/?[a-zA-Z]+\]/g, '').split(/[。！\n]/).pop();
  if (variable.kind === 'HpLoss' || /(?:失去|消耗|花费|耗能为)\s*$/.test(before)) return -1;
  return 1;
}
function changeCard(card) {
  const vars = candidateVars(card);
  if (!vars.length) return null;
  const variable = pick(vars);
  const polarity = beneficialDirection(card, variable);
  const direction = pick([polarity, polarity, -polarity]);
  const nextBase = numericStep(variable.base, direction, variable.kind);
  if (nextBase === variable.base) return null;
  const delta = nextBase - variable.base;
  const nextUp = Math.max(1, variable.up + delta);
  const label = variableLabel(card, variable) || [variable.id.replace(/([a-z])([A-Z])/g, '$1 $2'), variable.id.replace(/([a-z])([A-Z])/g, '$1 $2')];
  const benefit = direction === polarity;
  return { kind: 'number', card, variable, label, old: valuePair(variable.base, variable.up),
    next: valuePair(nextBase, nextUp), benefit, thought: Math.random() < .23 ?
      patchCopy.cardThought(variable, benefit) : null };
}
function hasIndependentUpgradeBenefit(card) {
  if (Number.isInteger(card.cost) && Number.isInteger(card.upCost) && card.upCost < card.cost) return true;
  return candidateVars(card).some(variable =>
    beneficialDirection(card, variable) * (variable.up - variable.base) > 0);
}
function keywordOptions(card) {
  const baseExhausts = card.keywords.includes('Exhaust');
  const upgradedExhausts = card.upKeywords.includes('Exhaust');
  const options = [];
  if (baseExhausts && upgradedExhausts) {
    options.push({scope:'both', exhaust:false}, {scope:'upgraded', exhaust:false});
  } else if (!baseExhausts && !upgradedExhausts) {
    options.push({scope:'both', exhaust:true});
  } else if (baseExhausts && !upgradedExhausts && hasIndependentUpgradeBenefit(card)) {
    options.push({scope:'both', exhaust:false}, {scope:'upgraded', exhaust:true});
  }
  return options;
}
function changeKeyword(card) {
  const options = keywordOptions(card);
  if (!options.length) return null;
  const choice = pick(options);
  const upgradedOnly = choice.scope === 'upgraded';
  const text = choice.exhaust
    ? (upgradedOnly ? ['升级后也会消耗。', 'The upgraded version now also Exhausts.'] : ['现在会消耗。', 'Now Exhausts.'])
    : (upgradedOnly ? ['升级后不再消耗。', 'The upgrade now removes Exhaust.'] : ['不再消耗。', 'No longer Exhausts.']);
  const thought = choice.exhaust
    ? (upgradedOnly ? ['升级仍保留更高的数值，这次仅收回移除消耗的额外收益。', 'The upgrade keeps its higher numbers; this only removes the additional benefit of losing Exhaust.'] :
      ['这张牌在反复打出时收益过高。让它消耗应该能保留爆发回合，同时减少循环中的压力。', 'Repeated plays were paying off too much. Exhaust should keep the burst turn while easing the pressure in loops.'])
    : (upgradedOnly ? ['移除升级后的消耗词条，应该能让升级的收益更明确。', 'Removing Exhaust from the upgrade should make its benefit clearer.'] :
      ['移除消耗后，这张牌应该能在较长的战斗中找到更稳定的用途。', 'Removing Exhaust should give this card a steadier role in longer fights.']);
  return {kind:'keyword', card, scope:choice.scope, exhaust:choice.exhaust,
    text, thought: Math.random() < .35 ? thought : null};
}
function changeUpgrade(card) {
  const vars = candidateVars(card).filter(variable =>
    beneficialDirection(card, variable) * (variable.up - variable.base) >= 0);
  if (vars.length && Math.random() < .7) {
    const variable = pick(vars);
    const direction = beneficialDirection(card, variable);
    const next = numericStep(variable.up, direction, variable.kind);
    if (next !== variable.up) {
      const label = variableLabel(card, variable);
      return {kind:'upgrade', card, variable, label, old:String(variable.up), next:String(next),
        thought: patchCopy.cardThought(variable, true, 'upgrade')};
    }
  }
  if (Number.isInteger(card.upCost) && card.upCost > 0) return {kind:'upgradeCost', card,
    old:String(card.upCost), next:String(card.upCost-1),
    thought:['升级后降低耗能应该能让这张牌更容易融入高费用牌组。', 'Lowering the upgraded cost should help this fit into more expensive decks.']};
  return null;
}
function changeBaseOnly(card) {
  const vars = candidateVars(card);
  if (!vars.length) return null;
  const variable = pick(vars);
  const polarity = beneficialDirection(card, variable);
  const next = numericStep(variable.base, polarity, variable.kind);
  if (next === variable.base || polarity * (variable.up - next) <= 0) return null;
  return {kind:'baseOnly', card, variable, label: variableLabel(card, variable),
    old:String(variable.base), next:String(next),
    thought:patchCopy.cardThought(variable, true, 'base')};
}
function changeCost(card) {
  if (!Number.isInteger(card.cost) || !Number.isInteger(card.upCost) ||
      card.cost < 0 || card.upCost < 0 || card.cost > 5 || card.upCost > 5) return null;
  const lower = Math.random() < .65;
  if (lower && (card.cost === 0 || card.upCost === 0)) return null;
  if (!lower && (card.cost === 5 || card.upCost === 5)) return null;
  const delta = lower ? -1 : 1;
  return {kind:'cost', card, old:valuePair(card.cost, card.upCost),
    next:valuePair(card.cost + delta, card.upCost + delta), benefit:lower};
}
function changeRarity(card) {
  if (!['Common', 'Uncommon'].includes(card.rarity)) return null;
  const moreCommon = card.rarity === 'Uncommon';
  return {kind:'rarity', card,
    old:moreCommon ? ['罕见','Uncommon'] : ['普通','Common'],
    next:moreCommon ? ['普通','Common'] : ['罕见','Uncommon'],
    thought:moreCommon ?
      ['我们想让这张牌更常成为构筑的起点，再观察它对牌池的影响。', 'We want this card to be a more common starting point for builds and will watch its effect on the pool.'] :
      ['这张牌在普通牌池中的出现频率偏高，因此先调整稀有度。', 'This card appeared a little too often in the Common pool, so we are adjusting its rarity first.']};
}
function changeDiverse(card) {
  const choices = ['number', 'number', 'number', 'upgrade', 'baseOnly', 'cost', 'rarity'];
  if (card.type === 'Attack' || card.type === 'Skill') choices.push('keyword');
  const kind = pick(choices);
  return kind === 'keyword' ? changeKeyword(card) :
    kind === 'upgrade' ? (changeUpgrade(card) || changeCard(card)) :
    kind === 'baseOnly' ? (changeBaseOnly(card) || changeCard(card)) :
    kind === 'cost' ? (changeCost(card) || changeCard(card)) :
    kind === 'rarity' ? (changeRarity(card) || changeCard(card)) : changeCard(card);
}
function cleanDescription(template, card, lang) {
  const variables = Object.fromEntries(card.vars.map(v => [v.id, v]));
  return template.replace(/\{Stars:diff\(\)\}\{singleStarIcon\}/g, '{Stars:starIcons()}')
    .replace(/\[\/?[a-zA-Z]+\]/g, '').replace(/\{([^{}:]+):([^{}]+)\}/g, (_, id, modifier) => {
    const v = variables[id];
    if (!v) return '';
    if (modifier.startsWith('plural:')) return v.base === 1 ? modifier.slice(7).split('|')[0] : modifier.slice(7).split('|')[1] || '';
    if (modifier.startsWith('energyIcons')) return valuePair(v.base, v.up) + (lang === 'zh' ? '点能量' : ' Energy');
    if (modifier.startsWith('starIcons')) return valuePair(v.base, v.up) + (lang === 'zh' ? '点辉星' : ' Stars');
    return valuePair(v.base, v.up);
  }).replace(/\{singleStarIcon\}/g, lang === 'zh' ? '1点辉星' : '1 Star')
    .replace(/\s+/g, ' ').replace(/([。！？；，]) +(?=[\p{Script=Han}])/gu, '$1').trim();
}
function canShowOriginalDescription(card) {
  const supported = /\{[A-Za-z][A-Za-z0-9_]*:(?:diff\(\)|energyIcons\(\)|starIcons\(\))\}|\{singleStarIcon\}/g;
  const knownVariables = new Set(card.vars.map(variable => variable.id));
  return [card.descZh, card.descEn].every(template =>
    !/[{}]/.test(template.replace(supported, '')) &&
    [...template.matchAll(/\{([A-Za-z][A-Za-z0-9_]*):(diff\(\)|energyIcons\(\)|starIcons\(\))\}/g)]
      .every(match => knownVariables.has(match[1])));
}
function makeRework(card) {
  const generated = cardEffectGenerator.generate(card.pool, card.type, card.cost);
  return { kind: 'rework', card, old: [cleanDescription(card.descZh, card, 'zh'), cleanDescription(card.descEn, card, 'en')], next: generated.effect,
    oldFrame: { rarity: card.rarity, type: card.type, cost: card.cost, upCost: card.upCost },
    newFrame: { rarity: card.rarity, type: generated.type, cost: generated.cost, upCost: generated.upCost },
    signature: generated.signature,
    thought: patchCopy.reworkThought() };
}
function makeNew(pool, existingEntries = []) {
  const bank = wordBanks[pool];
  const available = bank.names.map((_, index) => index).filter(index =>
    !existingEntries.some(entry => entry.kind === 'new' && entry.name === bank.names[index]));
  const index = pick(available);
  const generated = cardEffectGenerator.generate(pool, draftFrames[pool][index].type);
  return { kind: 'new', pool, name: bank.names[index], effect: generated.effect,
    frame: { rarity: 'Uncommon', type: generated.type, cost: generated.cost, upCost: generated.upCost },
    signature: generated.signature,
    thought: patchCopy.newThought(pool) };
}
function organizeEntries(entries) {
  const usedThoughts = new Set();
  for (const pool of pools) {
    for (const entry of entries[pool]) {
      if (!entry.thought) continue;
      const key = entry.thought[0];
      if (usedThoughts.has(key)) entry.thought = null;
      else usedThoughts.add(key);
    }
    entries[pool].sort((a, b) => Number(Boolean(b.thought)) - Number(Boolean(a.thought)));
  }
}
function changeDirection(oldValue, nextValue) {
  return Number.parseInt(nextValue, 10) > Number.parseInt(oldValue, 10) ? '提升至' : '降低至';
}
function englishDirection(oldValue, nextValue) {
  return Number.parseInt(nextValue, 10) > Number.parseInt(oldValue, 10) ? 'increased' : 'decreased';
}
function uniqueCopy(count, generated, fixed = [], generatedChance = .8) {
  const result = [], seen = new Set();
  for (let attempt = 0; result.length < count && attempt < count * 30; attempt++) {
    const line = Math.random() < generatedChance || !fixed.length ? generated() : pick(fixed);
    if (!seen.has(line[0])) { result.push(line); seen.add(line[0]); }
  }
  return result;
}
function bugList(count) {
  const fixed = bugs.map((item, index) => ({ text: item[0], category: bugCategories[index] }));
  const result = ['general', 'enemies', 'multiplayer'].map(category => ({ text: patchCopy.bug(category), category }));
  const seen = new Set(result.map(item => item.text[0]));
  for (let attempt = 0; result.length < count && attempt < count * 30; attempt++) {
    const category = pick(['general', 'general', 'enemies', 'multiplayer']);
    const candidates = fixed.filter(item => item.category === category);
    const item = Math.random() < .8 ? { text: patchCopy.bug(category), category } : pick(candidates);
    if (!seen.has(item.text[0])) { result.push(item); seen.add(item.text[0]); }
  }
  return shuffle(result);
}
function generatePatch() {
  const entries = {};
  const used = new Set();
  pools.forEach(pool => {
    const available = shuffle(catalog.filter(c => c.pool === pool && c.library &&
      (['Common','Uncommon','Rare'].includes(c.rarity) || Math.random() < .1 && c.rarity === 'Basic')));
    entries[pool] = [];
    const target = rand(3, 5);
    for (const card of available) {
      if (entries[pool].length >= target) break;
      if (used.has(card.en)) continue;
      const result = changeDiverse(card);
      if (result) { entries[pool].push(result); used.add(card.en); }
    }
  });
  const reworkPool = pick(pools.slice(0, 5));
  const reworkCard = pick(catalog.filter(c => c.pool === reworkPool && !used.has(c.en) &&
    ['Common', 'Uncommon', 'Rare'].includes(c.rarity) && ['Attack', 'Skill', 'Power'].includes(c.type) &&
    c.cost >= 0 && c.upCost >= 0 && c.descEn.length < 190 &&
    canShowOriginalDescription(c)));
  if (reworkCard) { entries[reworkPool].splice(rand(0, entries[reworkPool].length), 0, makeRework(reworkCard)); used.add(reworkCard.en); }
  if (Math.random() < .18) {
    const newPool = pick(pools);
    entries[newPool].push(makeNew(newPool, entries[newPool]));
    if (Math.random() < .08) {
      const secondPool = pick(pools.filter(p => p !== newPool));
      entries[secondPool].push(makeNew(secondPool, entries[secondPool]));
    }
  }
  if (Math.random() < .34) {
    const removePool = pick(pools.slice(0, 5));
    const removable = catalog.filter(c => c.pool === removePool && !used.has(c.en) && c.rarity === 'Uncommon');
    if (removable.length) entries[removePool].push({ kind: 'remove', card: pick(removable),
      thought: ['这张牌目前与该角色的其他选择过于相似。我们会观察移除后牌池的表现。', 'This card currently overlaps too much with other options for this character. We’ll watch how the pool feels without it.'] });
  }
  const ancients = (Math.random() < .45 ? shuffle(ancientReferences).slice(0, 1) : []).map(item => {
    const direction = item.direction || (Math.random() < .65 ? (item.benefit ? 1 : -1) : (item.benefit ? -1 : 1));
    const next = numericStep(item.base, direction, item.stat[1]);
    return { ...item, old: valuePair(item.base, item.up || item.base),
      next: valuePair(next, item.up ? item.up + next - item.base : next),
      buff: direction * (item.benefit ? 1 : -1) > 0 };
  });
  if (Math.random() < .75) ancients.unshift(worldGenerator.ancientMove(world));
  if (Math.random() < .78 || !ancients.length) {
    let relic = worldGenerator.relic(world, 'Ancient');
    for (let tries = 0; tries < 8 && ancients.some(item => item.name === "Nonupeipe's Signet Ring" && relic.id === 'SIGNET_RING'); tries++)
      relic = worldGenerator.relic(world, 'Ancient');
    if (!ancients.some(item => item.name === "Nonupeipe's Signet Ring" && relic.id === 'SIGNET_RING')) ancients.push(relic);
  }
  const enemies = worldGenerator.enemies(world);
  if (Math.random() < .28) {
    const intent = pick(enemyChanges.filter(item => !enemies.some(enemy => enemy.name[1] === item.name[1])));
    if (intent) enemies.push(intent);
  }
  organizeEntries(entries);
  patch = { intro: Math.random() < .8 ? patchCopy.intro() : pick(intros),
    bridge: Math.random() < .8 ? patchCopy.bridge() : pick(bridges),
    ending: Math.random() < .8 ? patchCopy.ending() : pick(endings), entries, ancients,
    general: Math.random() < .8 ? shuffle(['merchant', 'map', 'reward']).slice(0, rand(1, 2)).map(kind => patchCopy.general(kind)) : [],
    enemies,
    relics: Math.random() < .72 ? worldGenerator.relics(world) : [],
    events: Math.random() < .46 ? [Math.random() < .8 ? patchCopy.event() : pick(eventChanges)] : [],
    writing: Math.random() < .62 ? uniqueCopy(rand(1, 2), patchCopy.writing, writingLines) : [],
    localization: Math.random() < .48 ? uniqueCopy(rand(1, 2), patchCopy.localization, localizationLines) : [],
    ux: uniqueCopy(rand(3, 5), patchCopy.ux, uxLines),
    bugs: bugList(rand(6, 9)),
    modding: uniqueCopy(rand(2, 4), patchCopy.modding, modLines), likes: rand(420, 2700), comments: rand(55, 430) };
  liked = false;
  disliked = false;
  render();
  $('landing').classList.add('hidden');
  $('article-shell').classList.remove('hidden');
}
function cardFrameText(frame) {
  const types = { Attack: ['攻击牌', 'Attack'], Skill: ['技能牌', 'Skill'], Power: ['能力牌', 'Power'] };
  const rarities = { Common: ['普通', 'Common'], Uncommon: ['罕见', 'Uncommon'], Rare: ['稀有', 'Rare'] };
  const position = language === 'zh' ? 0 : 1;
  const cost = valuePair(frame.cost, frame.upCost);
  return types[frame.type][position] + ' - ' + (language === 'zh' ? '耗能' : 'Cost ') + cost + ' - ' + rarities[frame.rarity][position];
}
function cardDetail(name, frame, effect) {
  return escapeHtml(name) + ' - ' + escapeHtml(cardFrameText(frame)) + ' - “' + escapeHtml(tr(effect)) + '”';
}
function lineFor(entry) {
  if (entry.kind === 'new') {
    const name = tr(entry.name);
    return '<li>' + (language === 'zh' ? '新增卡牌<strong>' : 'Added <strong>') + escapeHtml(name) +
      (language === 'zh' ? '</strong>：' : '</strong> card: ') + escapeHtml(cardFrameText(entry.frame)) +
      ' - “' + escapeHtml(tr(entry.effect)) + '”</li>' + thoughtFor(entry);
  }
  const name = escapeHtml(language === 'zh' ? entry.card.zh : entry.card.en);
  if (entry.kind === 'remove')
    return '<li>' + (language === 'zh' ? '移除了<strong>' : 'Removed <strong>') + name + (language === 'zh' ? '</strong>。</li>' : '</strong> card.</li>') + thoughtFor(entry);
  if (entry.kind === 'rework') {
    const plainName = language === 'zh' ? entry.card.zh : entry.card.en;
    return '<li>' + (language === 'zh' ? '重做了<strong>' : 'Reworked <strong>') + name +
      (language === 'zh' ? '</strong>：' : '</strong> card:') +
      '<ul class="rework-details"><li>' + (language === 'zh' ? '旧：' : 'Old: ') + cardDetail(plainName, entry.oldFrame, entry.old) +
      '</li><li>' + (language === 'zh' ? '新：' : 'New: ') + cardDetail(plainName, entry.newFrame, entry.next) +
      '</li></ul></li>' + thoughtFor(entry);
  }
  if (entry.kind === 'keyword') return '<li>' + (language === 'zh' ? '修改了<strong>' : 'Changed <strong>') +
    name + (language === 'zh' ? '</strong>：' : '</strong> card: ') + escapeHtml(tr(entry.text)) + '</li>' + thoughtFor(entry);
  if (entry.kind === 'rarity') return '<li>' + (language === 'zh' ? '修改了<strong>' : 'Changed <strong>') +
    name + (language === 'zh' ? '</strong>：稀有度由' : '</strong> card: rarity changed from ') +
    escapeHtml(tr(entry.old)) + (language === 'zh' ? '改为' : ' → ') +
    escapeHtml(tr(entry.next)) + (language === 'zh' ? '。</li>' : '.</li>') + thoughtFor(entry);
  if (entry.kind === 'cost') {
    const verb = language === 'zh' ? (entry.benefit ? '加强了' : '削弱了') : (entry.benefit ? 'Buffed' : 'Nerfed');
    return '<li>' + verb + (language === 'zh' ? '<strong>' : ' <strong>') + name +
      (language === 'zh' ? '</strong>：耗能从' : '</strong> card: cost ' + englishDirection(entry.old, entry.next) + ' from ') + entry.old +
      (language === 'zh' ? changeDirection(entry.old, entry.next) : ' → ') + entry.next + '</li>' + thoughtFor(entry);
  }
  if (['upgrade','upgradeCost','baseOnly'].includes(entry.kind)) {
    const label = entry.kind === 'upgradeCost' ? ['耗能','cost'] : entry.label;
    if (language === 'zh') {
      const subject = entry.variable?.kind === 'Energy' ?
        (entry.kind === 'baseOnly' ? '未升级时获得的能量' : '升级后获得的能量') :
        entry.kind === 'baseOnly' ? '未升级时的' + tr(label) :
        entry.kind === 'upgradeCost' ? '升级后' + tr(label) : '升级后的' + tr(label);
      return '<li>加强了<strong>' + name + '</strong>：' + escapeHtml(subject) + '从' + entry.old + changeDirection(entry.old, entry.next) + entry.next + '</li>' + thoughtFor(entry);
    }
    const prefix = entry.kind === 'baseOnly' ? 'unupgraded' : 'upgraded';
    return '<li>Buffed <strong>' + name + '</strong> card: ' + prefix + ' ' + escapeHtml(tr(label)) +
      ' ' + englishDirection(entry.old, entry.next) + ' from ' + entry.old + ' → ' + entry.next + '</li>' + thoughtFor(entry);
  }
  const label = escapeHtml(tr(entry.label));
  const verb = language === 'zh' ? (entry.benefit ? '加强了' : '削弱了') : (entry.benefit ? 'Buffed' : 'Nerfed');
  const change = language === 'zh' ? label + '从' + entry.old + changeDirection(entry.old, entry.next) + entry.next :
    label + ' ' + englishDirection(entry.old, entry.next) + ' from ' + entry.old + ' → ' + entry.next;
  return '<li>' + verb + (language === 'zh' ? '<strong>' : ' <strong>') + name +
    (language === 'zh' ? '</strong>：' : '</strong> card: ') + escapeHtml(change) + '</li>' + thoughtFor(entry);
}
function thoughtFor(entry) { return entry.thought ? '<li class="thought">' + escapeHtml(tr(entry.thought)) + '</li>' : ''; }
function list(lines) { return '<ul>' + lines.map(line => '<li>' + escapeHtml(tr(line)) + '</li>').join('') + '</ul>'; }
function relicLine(item) {
  const name = escapeHtml(tr(item.name));
  return '<li>' + (language === 'zh' ? '修改了<strong>' : 'Changed <strong>') + name +
    (language === 'zh' ? '</strong>：由“' : '</strong> relic: from “') + escapeHtml(tr(item.old)) +
    (language === 'zh' ? '”改为“' : '” → “') + escapeHtml(tr(item.next)) + '”</li>';
}
function ancientLine(item) {
  if (item.kind === 'relic') return relicLine(item);
  if (item.kind === 'move') {
    const owner = escapeHtml(tr(item.owner)), relic = escapeHtml(tr(item.relic));
    return '<li>' + (language === 'zh' ? '将<strong>' + owner + '</strong>的<strong>' + relic + '</strong>从选项池' + item.from + '移至选项池' + item.to + '。' :
      'Moved <strong>' + owner + '&#39;s ' + relic + '</strong> relic from option pool ' + item.from + ' to option pool ' + item.to + '.') + '</li>';
  }
  return '<li>' + (language === 'zh' ? (item.buff ? '加强了' : '削弱了') : (item.buff ? 'Buffed ' : 'Nerfed ')) +
    '<strong>' + escapeHtml(language === 'zh' ? item.zh : item.name) +
    (language === 'zh' ? '</strong>：' : '</strong> ' + item.type + ': ') +
    escapeHtml(tr(item.stat)) + (language === 'zh' ? '从' : ' ' + englishDirection(item.old, item.next) + ' from ') + item.old +
    (language === 'zh' ? changeDirection(item.old, item.next) : ' → ') + item.next + '</li>';
}
function enemyLine(item) {
  const name = escapeHtml(tr(item.name));
  if (item.kind === 'intent') return '<li>' + (language === 'zh' ? '修改了<strong>' : 'Changed <strong>') + name +
    (language === 'zh' ? '</strong>：' : '</strong>: ') + escapeHtml(tr(item.text)) + '</li>';
  const stat = item.kind === 'hp' ? ['生命值', 'HP'] : item.kind === 'strength' ? ['力量增益', 'Strength gain'] :
    item.kind === 'galvanic' ? ['电流增益', 'Galvanic power'] : ['伤害', 'damage'];
  const move = item.move ? escapeHtml(tr(item.move)) + (language === 'zh' ? '动作的' : ' move ') : '';
  if (language === 'zh') return '<li>' + (item.buff ? '加强了' : '削弱了') + '<strong>' + name + '</strong>：' +
    move + escapeHtml(tr(stat)) + (item.ascension ? '在进阶' + item.ascension + '时' : '') +
    '从' + item.old + (item.buff ? '提升至' : '降低至') + item.next + '</li>';
  return '<li>' + (item.buff ? 'Buffed' : 'Nerfed') + ' <strong>' + name + '</strong>: ' + move + escapeHtml(tr(stat)) +
    (item.ascension ? ' at A' + item.ascension : '') + (item.buff ? ' increased from ' : ' decreased from ') + item.old + ' → ' + item.next + '</li>';
}
function render() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? '下一次塔2更新？' : 'Next STS2 Patch?';
  $('lang-zh').classList.toggle('active', language === 'zh');
  $('lang-en').classList.toggle('active', language === 'en');
  $('article-zh').classList.toggle('active', language === 'zh');
  $('article-en').classList.toggle('active', language === 'en');
  for (const [id, key] of Object.entries({
    'generate-main':'generate','generate-again':'again','post-type':'type','post-date':'date',
    'nav-store':'store','nav-community':'community','nav-about':'about','nav-support':'support',
    'crumb-community':'crumbCommunity','crumb-news':'news','game-label':'gameLabel',
    'date-label':'dateLabel','post-type-label':'typeLabel','side-controls-title':'controls',
    'side-note':'sideNote','like-label':'like','comment-label':'comment','share-label':'share'
  })) $(id).textContent = tr(ui[key]);
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) $('share-label').textContent = tr(ui.preview);
  $('preview-title').textContent = tr(ui.previewHint);
  $('preview-save').textContent = tr(ui.previewSave);
  $('preview-close').setAttribute('aria-label', tr(ui.previewClose));
  $('preview-image').alt = tr(ui.preview);
  $('dislike-button').setAttribute('aria-label', tr(ui.dislike));
  if (!patch) return;
  let html = '<p>' + escapeHtml(tr(patch.intro)) + '</p><p>' + escapeHtml(tr(patch.bridge)) + '</p>';
  html += '<h2>' + tr(ui.content) + '</h2>';
  if (patch.general.length) html += '<h3>' + tr(ui.general) + (language === 'zh' ? '：' : ':') + '</h3>' + list(patch.general);
  html += '<h3>' + (language === 'zh' ? '先古之民：' : 'Ancients:') + '</h3><ul>';
  html += patch.ancients.map(ancientLine).join('');
  html += '</ul>';
  html += '<h3>' + tr(ui.enemies) + (language === 'zh' ? '：' : ':') + '</h3><ul>' + patch.enemies.map(enemyLine).join('') + '</ul>';
  for (const pool of pools) {
    html += '<h3>' + tr(poolNames[pool]) + (language === 'zh' ? '：' : ':') + '</h3><ul>';
    html += patch.entries[pool].map(lineFor).join('');
    html += '</ul>';
  }
  if (patch.relics.length) html += '<h3>' + tr(ui.relics) + (language === 'zh' ? '：' : ':') + '</h3><ul>' + patch.relics.map(relicLine).join('') + '</ul>';
  if (patch.events.length) html += '<h3>' + tr(ui.events) + (language === 'zh' ? '：' : ':') + '</h3>' + list(patch.events);
  if (patch.writing.length) html += '<h2>' + tr(ui.writing) + '</h2>' + list(patch.writing);
  if (patch.localization.length) html += '<h2>' + tr(ui.localization) + '</h2>' + list(patch.localization);
  html += '<h2>' + tr(ui.ux) + '</h2><h3>' + tr(ui.general) + (language === 'zh' ? '：' : ':') + '</h3>' + list(patch.ux);
  html += '<h2>' + tr(ui.bugs) + '</h2>';
  for (const [category, heading] of [['general', ui.general], ['enemies', ui.enemies], ['multiplayer', ui.multiplayer]]) {
    const lines = patch.bugs.filter(item => item.category === category).map(item => item.text);
    if (lines.length) html += '<h3>' + tr(heading) + (language === 'zh' ? '：' : ':') + '</h3>' + list(lines);
  }
  html += '<h2>' + tr(ui.modding) + '</h2>' + list(patch.modding);
  html += '<p class="closing">' + escapeHtml(tr(patch.ending)) + '</p>';
  html += '<p class="fiction-note">' + escapeHtml(tr(ui.sideNote)) + '</p>';
  $('article-content').innerHTML = html;
  $('like-count').textContent = (patch.likes + Number(liked)).toLocaleString();
  $('like-button').classList.toggle('selected', liked);
  $('like-button').setAttribute('aria-pressed', liked);
  $('dislike-button').classList.toggle('selected', disliked);
  $('dislike-button').setAttribute('aria-pressed', disliked);
  $('comment-count').textContent = patch.comments.toLocaleString();
  $('comments').innerHTML = '<strong>' + (language === 'zh' ? '社区评论' : 'Community comments') + '</strong>' +
    (language === 'zh' ? '<p><strong>SpireFan:</strong> 等一下，这个数值真的改了吗？</p><p><strong>OstyEnjoyer:</strong> 先让我开一局试试。</p>' :
      '<p><strong>SpireFan:</strong> Wait, did that number really change?</p><p><strong>OstyEnjoyer:</strong> Let me try a run first.</p>');
}
function setLanguage(next) { language = next; render(); }
$('lang-zh').addEventListener('click', () => setLanguage('zh'));
$('lang-en').addEventListener('click', () => setLanguage('en'));
$('article-zh').addEventListener('click', () => setLanguage('zh'));
$('article-en').addEventListener('click', () => setLanguage('en'));
function safeGenerate() {
  try { generatePatch(); }
  catch (error) { console.error('Patch generation failed:', error); $('generate-main').textContent = 'Generation error'; }
}
let regenerating = false;
function smoothRegenerate() {
  if (regenerating) return;
  regenerating = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const finishAtTop = () => {
    if (window.scrollY > 1) {
      requestAnimationFrame(finishAtTop);
      return;
    }
    safeGenerate();
    regenerating = false;
  };
  requestAnimationFrame(finishAtTop);
}
$('generate-main').addEventListener('click', safeGenerate);
$('generate-again').addEventListener('click', smoothRegenerate);
$('like-button').addEventListener('click', () => { liked = !liked; if (liked) disliked = false; render(); });
$('dislike-button').addEventListener('click', () => { disliked = !disliked; if (disliked) liked = false; render(); });
$('comment-button').addEventListener('click', () => {
  const shown = !$('comments').classList.toggle('hidden');
  $('comment-button').setAttribute('aria-expanded', shown);
});
function closeImagePreview() {
  $('image-preview').classList.add('hidden');
  $('preview-image').removeAttribute('src');
  $('preview-save').removeAttribute('href');
  if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
  previewImageUrl = null;
}
$('preview-close').addEventListener('click', closeImagePreview);
$('image-preview').addEventListener('click', event => {
  if (event.target === $('image-preview')) closeImagePreview();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('image-preview').classList.contains('hidden')) closeImagePreview();
});
$('share-button').addEventListener('click', async () => {
  const button = $('share-button');
  button.disabled = true;
  try {
    const article = document.querySelector('.news-panel');
    const canvas = await html2canvas(article, {
      backgroundColor: '#292c32', scale: 3, useCORS: true,
      windowWidth: Math.max(window.innerWidth, 900),
      onclone: clonedDocument => {
        const panel = clonedDocument.querySelector('.news-panel');
        panel.style.width = '760px';
        panel.style.maxWidth = '760px';
        panel.querySelector('.sidebar').style.display = 'none';
        panel.querySelector('.layout').style.display = 'block';
        const content = panel.querySelector('#article-content');
        content.style.padding = '0 20px 18px';
        content.style.fontSize = '15px';
        content.style.lineHeight = '1.42';
        panel.querySelector('.breadcrumbs').style.padding = '20px 20px 0';
        panel.querySelector('h1').style.margin = '20px 20px 26px';
        panel.querySelector('.article-footer').style.padding = '18px 20px 22px';
      }
    });
    const footerHeight = 114;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height + footerHeight;
    const exportContext = exportCanvas.getContext('2d');
    exportContext.drawImage(canvas, 0, 0);
    exportContext.fillStyle = '#22262c';
    exportContext.fillRect(0, canvas.height, canvas.width, footerHeight);
    exportContext.strokeStyle = '#59616a';
    exportContext.beginPath();
    exportContext.moveTo(60, canvas.height + 1);
    exportContext.lineTo(canvas.width - 60, canvas.height + 1);
    exportContext.stroke();
    exportContext.fillStyle = '#9ec9e5';
    exportContext.font = '36px Arial, sans-serif';
    exportContext.textAlign = 'center';
    exportContext.textBaseline = 'middle';
    exportContext.fillText('https://mewcodex.github.io/NextSTS2Update/', canvas.width / 2, canvas.height + footerHeight / 2);
    const imageBlob = await new Promise(resolve => exportCanvas.toBlob(resolve, 'image/png'));
    if (!imageBlob) throw new Error('Image encoding failed');
    const imageUrl = URL.createObjectURL(imageBlob);
    const filename = `Next-STS2-Patch-v0.112.0-${language}.png`;
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
      previewImageUrl = imageUrl;
      $('preview-image').src = imageUrl;
      $('preview-save').href = imageUrl;
      $('preview-save').download = filename;
      $('image-preview').classList.remove('hidden');
      $('preview-close').focus();
    } else {
      const anchor = document.createElement('a');
      anchor.download = filename;
      anchor.href = imageUrl;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(imageUrl), 60000);
      $('share-label').textContent = tr(ui.copied);
      setTimeout(() => $('share-label').textContent = tr(ui.share), 2500);
    }
  } catch (error) {
    console.error('Image export failed:', error);
    $('share-label').textContent = language === 'zh' ? '导出失败' : 'Export failed';
  } finally {
    button.disabled = false;
  }
});
Promise.all(['cards.json', 'world.json'].map(async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error(path + ' unavailable');
  return response.json();
})).then(([cards, worldData]) => {
  catalog = cards;
  world = worldData;
  $('generate-main').disabled = false;
}).catch(() => {
  $('generate-main').disabled = true;
  $('generate-main').textContent = language === 'zh' ? '游戏数据加载失败' : 'Game data unavailable';
});
$('generate-main').disabled = true;
render();
