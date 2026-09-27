/* All copy and balance changes are assembled locally; no model or network call runs on generation. */
const $ = id => document.getElementById(id);
const pick = values => values[Math.floor(Math.random() * values.length)];
const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = values => [...values].sort(() => Math.random() - 0.5);
let language = 'zh';
let catalog = [];
let patch = null;
let liked = false;
let disliked = false;

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
  dislike: ['踩', 'Dislike'], copied: ['已保存', 'Saved'],
  content: ['内容与平衡：', 'CONTENT & BALANCE:'], ux: ['用户体验与界面：', 'USER EXPERIENCE & INTERFACE:'],
  bugs: ['错误修复：', 'BUG FIXES:'], modding: ['模组开发：', 'MODDING:'],
  general: ['通用', 'General'], enemies: ['敌人', 'Enemies'], multiplayer: ['多人游戏', 'Multiplayer']
};
const tr = pair => pair[language === 'zh' ? 0 : 1];
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

const intros = [
  ['又到了 Beta 更新的时候，爬塔者们！这次我们继续调整一些牌组中常见的选择，也解决了几处在多人游戏里不太容易复现的问题。', 'It’s time for another beta patch, Slayers! This round takes another pass at a few familiar deck choices and addresses some harder-to-reproduce multiplayer issues.'],
  ['我们回来了！短暂休息之后，团队重新投入了爬塔工作。这次更新以平衡和稳定性为主，同时为后续的较大内容打下基础。', 'We’re back! After a short break, the team has returned to the Spire. This update focuses on balance and stability while laying groundwork for larger things ahead.'],
  ['又一个 Beta 补丁来了！本次有几项卡牌重做、一些数值调整，以及一长串只有在非常具体的情况下才会遇到的修复。', 'Another beta patch is here! There are a couple of card reworks, a handful of number adjustments, and a long list of fixes for very specific situations.'],
  ['嘿，爬塔者们！我们还在尝试让更多构筑有机会发挥，所以这次既有小幅增强，也有几处需要再观察的改动。', 'Hey Slayers! We’re still experimenting with ways to give more builds room to shine, so this patch includes some small buffs and a few changes we’ll be watching closely.'],
  ['这次的公告比上次稍短一些，不过还是有不少值得测试的变化。尤其欢迎大家告诉我们，哪些改动在实战里和纸面上感觉不同。', 'These notes are a little shorter than last time, but there’s still plenty to test. We’re especially interested in changes that feel different in a run than they do on paper.'],
  ['新的 Beta 更新现已推出！这轮主要是根据近期反馈做一些细致调整，顺手处理了几处战斗顺序问题。', 'A new beta update is live! This pass makes a few targeted changes based on recent feedback and clears up some combat ordering issues along the way.'],
  ['爬塔者们，我们听到了你们对部分卡牌的反馈。今天的更新会给一些旧面孔新的用途，也会让少数表现过强的数值稍微收敛。', 'Slayers, we’ve heard your feedback on a few cards. Today’s update gives some familiar faces new jobs and brings a few overperforming numbers back down.'],
  ['从假期回来后，我们一直在测试几项更大的内容。那些还需要一点时间；与此同时，这里有一份新的 Beta 更新供大家体验。', 'Since returning from our break, we’ve been testing some bigger pieces of content. Those need a bit more time; in the meantime, here’s a fresh beta patch to play with.'],
  ['是时候再来一次实验性平衡更新了。Beta 分支的东西总有可能再变，所以请继续用游戏内反馈工具告诉我们你的体验。', 'It’s time for another experimental balance pass. Things on the beta branch can always change again, so please keep telling us how these feel through the in-game feedback tool.'],
  ['这次我们把重点放在那些“几乎可用”的牌上。一两个数值有时足以改变它们在牌组里的位置，看看这轮会发生什么吧。', 'This time we’re focusing on cards that have felt almost there. A number or two can change where they fit into a deck, so let’s see what this pass does.'],
  ['大家好！本次 Beta 更新包括卡牌调整、界面上的几处便利改进，还有一些我们在复查近期报告时发现的修复。', 'Hi everyone! This beta update includes card adjustments, a few interface conveniences, and fixes we found while revisiting recent reports.'],
  ['塔里的工作仍在继续。本轮更新没有巨大的系统改动，但有不少小地方值得仔细看看。', 'Work on the Spire continues. There’s no huge systems change in this round, but quite a few smaller details are worth a closer look.'],
  ['这次更新的核心是一批卡牌和体验调整。我们还在推进月报里提到的长期项目，感谢大家在等待期间继续测试 Beta 分支。', 'This update is built around a batch of card and experience changes. We’re still working on the longer-term projects mentioned in the Neowsletter, and we appreciate everyone testing the beta in the meantime.']
];
const bridges = [
  ['下面是完整的更新内容。', 'On to the full patch notes.'],
  ['照例，欢迎继续向我们发送反馈。下面进入更新详情！', 'As always, please keep the feedback coming. On to the details!'],
  ['我们会密切留意这些改动的表现。现在来看看具体内容。', 'We’ll be keeping an eye on how these changes play out. Here are the details.']
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
  VigorPower: ['活力', 'Vigor'], PlatingPower: ['镀层', 'Plating'],
  DoomPower: ['末日', 'Doom'], Stars: ['星星', 'Stars']
};
Object.assign(labels, {
  Repeat: ['攻击次数', 'hits'], Forge: ['锻造次数', 'Forge amount'],
  OstyDamage: ['奥斯蒂伤害', 'Osty damage'], Summon: ['召唤数量', 'summons'],
  Shivs: ['小刀数量', 'Shivs'], BlockNextTurn: ['下回合格挡', 'next-turn Block'],
  MaxHp: ['最大生命', 'Max HP'], PanacheDamage: ['伤害', 'damage'],
  BombDamage: ['伤害', 'damage'], BlockOnExhaust: ['格挡', 'Block']
});
const thoughts = {
  Damage: [
    ['这张牌在前期需要更明确的即时收益，但我们希望它的核心玩法保持不变。', 'We wanted this to offer a clearer immediate payoff early in a run while keeping its core use intact.'],
    ['这个数值在升级前后都略显保守，因此两边一起调整。', 'The number felt a little conservative both before and after upgrading, so we adjusted both.']
  ],
  Block: [
    ['我们希望它能在防御回合里更稳定地找到位置。', 'We want this to find a more reliable place in defensive turns.'],
    ['这应该能让它与其他防御选择之间的取舍更有意思。', 'This should make the choice between it and other defensive options more interesting.']
  ],
  Cards: [
    ['多一张牌会带来很多连锁效果，我们会特别关注它的表现。', 'One extra card can have a lot of knock-on effects, so we’ll be watching this one closely.']
  ],
  default: [
    ['这属于一次小幅试验，我们会根据反馈继续调整。', 'This is a small experiment, and we’ll keep iterating based on feedback.'],
    ['我们想让它的回报与使用条件更加匹配。', 'We want its payoff to better match the conditions needed to use it.']
  ]
};
const nerfThoughts = [
  ['这张牌的回报略高于同类选择，因此我们先做一次小幅调整。', 'Its payoff has been a little high compared with similar options, so we’re trying a small adjustment.'],
  ['我们想为其他选择留出一点空间，并会继续观察它的表现。', 'We want to leave a little room for other options, and we’ll keep watching how it performs.']
];
const wordBanks = {
  Ironclad: { names: [['余烬契约', 'Ember Pact'], ['裂甲冲锋', 'Sunder Charge'], ['血铸号令', 'Bloodforged Order']], effects: [['失去 2 点生命。获得 1 点力量。', 'Lose 2 HP. Gain 1 Strength.'], ['造成 13(17) 点伤害。每有一张已消耗的牌，伤害增加 2 点。', 'Deal 13(17) damage. Deal 2 additional damage for each Exhausted card.'], ['获得 9(12) 点格挡。若本回合失去过生命，抽 1 张牌。', 'Gain 9(12) Block. If you lost HP this turn, draw 1 card.']] },
  Silent: { names: [['薄雾陷阱', 'Mist Trap'], ['回声毒刃', 'Echoing Fang'], ['暗影换位', 'Shadow Step']], effects: [['给予 5(7) 层中毒。若目标已中毒，抽 1 张牌。', 'Apply 5(7) Poison. If the target is Poisoned, draw 1 card.'], ['造成 7(10) 点伤害。下回合将一张小刀加入手牌。', 'Deal 7(10) damage. Add a Shiv to your hand next turn.'], ['获得 6(9) 点格挡。弃 1 张牌，然后抽 1 张牌。', 'Gain 6(9) Block. Discard 1 card, then draw 1 card.']] },
  Regent: { names: [['星轨校准', 'Stellar Alignment'], ['王权余辉', 'Royal Afterglow'], ['日冕敕令', 'Corona Decree']], effects: [['获得 2(3) 颗星星。你下一张攻击牌造成的伤害增加 4 点。', 'Gain 2(3) Stars. Your next Attack deals 4 additional damage.'], ['造成 10(14) 点伤害。若你拥有星星，获得 5 点格挡。', 'Deal 10(14) damage. If you have Stars, gain 5 Block.'], ['获得 7(10) 点格挡。下回合开始时获得 1 颗星星。', 'Gain 7(10) Block. At the start of your next turn, gain 1 Star.']] },
  Necrobinder: { names: [['灰骨回响', 'Ashbone Echo'], ['亡者借力', 'Borrowed Bones'], ['葬歌', 'Dirge']], effects: [['造成 8(11) 点伤害。奥斯蒂获得 3(4) 点最大生命。', 'Deal 8(11) damage. Osty gains 3(4) Max HP.'], ['牺牲奥斯蒂 4 点生命。获得 11(15) 点格挡。', 'Osty loses 4 HP. Gain 11(15) Block.'], ['抽 2 张牌。若奥斯蒂在场，再获得 1 点能量。消耗。', 'Draw 2 cards. If Osty is present, gain 1 Energy. Exhaust.']] },
  Defect: { names: [['电弧缓存', 'Arc Cache'], ['棱镜散射', 'Prism Scatter'], ['过载协议', 'Overload Protocol']], effects: [['造成 9(12) 点伤害。引导 1 个闪电充能球。', 'Deal 9(12) damage. Channel 1 Lightning Orb.'], ['获得 8(11) 点格挡。若你本回合激发过充能球，抽 1 张牌。', 'Gain 8(11) Block. If you Evoked an Orb this turn, draw 1 card.'], ['获得 1(2) 点集中。下回合开始时失去 1 点集中。', 'Gain 1(2) Focus. At the start of your next turn, lose 1 Focus.']] },
  Colorless: { names: [['临时同盟', 'Temporary Alliance'], ['空白契约', 'Blank Contract'], ['奇巧装置', 'Curious Device']], effects: [['从 3 张随机无色牌中选择 1 张加入手牌。本回合它的耗能为 0。消耗。', 'Choose 1 of 3 random Colorless cards to add to your hand. It costs 0 this turn. Exhaust.'], ['抽 2(3) 张牌。将一张手牌放到抽牌堆顶部。', 'Draw 2(3) cards. Put a card from your hand on top of your Draw Pile.'], ['获得 7(10) 点格挡。你下一张打出的牌消耗。', 'Gain 7(10) Block. The next card you play Exhausts.']] }
};
const ancientReferences = [
  { name: "Nonupeipe's Signet Ring", zh: '诺奴佩普的图章戒指', stat: ['金币', 'Gold'], base: 888, benefit: true },
  { name: 'Regalite', zh: '君王矿石', stat: ['格挡', 'Block'], base: 4, benefit: true },
  { name: "Tezcatara's Brightest Flame", zh: '特兹卡塔拉的至亮之焰', stat: ['最大生命损失', 'Max HP loss'], base: 2, benefit: false },
  { name: "Pael's Relax", zh: '佩尔的放松', stat: ['格挡', 'Block'], base: 16, up: 18, benefit: true }
];
const generalChanges = [
  ['进阶 6 的“通货膨胀”现在使商人移除卡牌的初始费用由 100 金币提高至 125 金币。', 'Ascension 6 Inflation now raises the initial merchant card removal cost from 100 to 125 Gold.'],
  ['进阶 6 的“通货膨胀”现在使商人移除卡牌的费用每次增长 25 金币，而非 50 金币。', 'Ascension 6 Inflation now increases the merchant card removal cost by 25 Gold each time instead of 50.'],
  ['地图上现在会略微增加休息处的出现机会。', 'Rest Sites now appear slightly more often on the map.'],
  ['地图上现在会略微减少问号房间的出现机会。', 'Unknown rooms now appear slightly less often on the map.'],
  ['商店中的遗物现在更少出现重复的稀有度组合。', 'Relics at the merchant now show repeated rarity combinations less often.'],
  ['遭遇精英战斗后的卡牌奖励现在更有机会出现稀有卡牌。', 'Card rewards after Elite fights now have a slightly higher chance to contain Rare cards.']
];
const enemyChanges = [
  {name:['巨斧机器人','Axebot'], move:['上勾锤击','Hammer Uppercut'], kind:'damage', old:'14(18)', next:'15(20)', tier:['低/高进阶','low/high Ascension']},
  {name:['巨斧机器人','Axebot'], move:['连环击','The One-Two'], kind:'damage', old:'10(11) × 2', next:'11(12) × 2', tier:['低/高进阶','low/high Ascension']},
  {name:['外骨骼虫','Exoskeleton'], kind:'hp', old:'24–28(26–30)', next:'24–28(28–32)', tier:['低/高进阶','low/high Ascension']},
  {name:['电球头','Globe Head'], kind:'galvanic', old:'6(8)', next:'6(9)', tier:['低/高进阶','low/high Ascension']},
  {name:['虱虫之祖','Louse Progenitor'], kind:'strength', old:'5(7)', next:'5(8)', tier:['低/高进阶','low/high Ascension']},
  {name:['灵魂异鱼','Soul Fysh'], move:['泄气','De-Gas'], kind:'damage', old:'16(18)', next:'17(19)', tier:['低/高进阶','low/high Ascension']},
  {name:['蜂群术士','Entomancer'], kind:'hp', old:'145(165)', next:'150(170)', tier:['低/高进阶','low/high Ascension']},
  {name:['巨斧机器人','Axebot'], move:['磨砺','Sharpen'], kind:'intent', text:['“磨砺”现在会同时获得格挡，意图由增益改为防御＋增益。','Sharpen now also gains Block, changing its intent from Buff to Defend + Buff.']},
  {name:['虱虫之祖','Louse Progenitor'], move:['蜷缩成长','Curl and Grow'], kind:'intent', text:['“蜷缩成长”不再获得格挡，意图由防御＋增益改为增益。','Curl and Grow no longer gains Block, changing its intent from Defend + Buff to Buff.']},
  {name:['灵魂异鱼','Soul Fysh'], move:['凝视','Gaze'], kind:'intent', text:['“凝视”现在会造成少量伤害，意图由负面效果改为攻击＋负面效果。','Gaze now deals a small amount of damage, changing its intent from Debuff to Attack + Debuff.']}
];
const bugs = [
  [['修复了在多人游戏中，一名玩家打出来自另一名角色的牌，同时队友结束回合时，某些效果偶尔会结算两次的问题。', 'Fixed some effects occasionally resolving twice in multiplayer when a player used another character’s card as a teammate ended their turn.']],
  [['修复了特定条件下，战斗结束时仍在等待结算的效果可能影响下一场战斗的问题。', 'Fixed pending effects at the end of combat occasionally carrying into the next combat under specific conditions.']],
  [['修复了使用控制器快速切换奖励选项时，描述文字有时会显示上一项内容的问题。', 'Fixed reward descriptions occasionally showing the previous choice when switching quickly with a controller.']],
  [['修复了在同一回合中连续生成并消耗一张牌时，战斗记录可能显示错误顺序的问题。', 'Fixed the combat log sometimes showing the wrong order when a card was created and Exhausted in the same turn.']],
  [['修复了当临时费用变化与升级同时发生时，卡牌预览偶尔不更新的问题。', 'Fixed card previews occasionally failing to refresh when temporary cost changes and upgrades happened together.']],
  [['修复了队友断线重连后，在极少数情况下地图投票状态不同步的问题。', 'Fixed map vote state rarely becoming out of sync after a teammate reconnected.']],
  [['修复了特定敌人的多段攻击在目标于攻击中途死亡时仍显示额外命中数字的问题。', 'Fixed an extra hit number appearing when the target of a certain multi-hit enemy attack died partway through the move.']],
  [['修复了查看另一名玩家的牌组时，部分关键词说明可能沿用上一张牌的问题。', 'Fixed some keyword tooltips using text from the previous card when viewing another player’s deck.']],
  [['修复了在暂停菜单打开的瞬间切换窗口焦点时，少数输入提示可能消失的问题。', 'Fixed some input prompts disappearing when window focus changed as the pause menu opened.']],
  [['修复了一个只会在生成卡牌、复制卡牌与回合结束效果同一帧发生时出现的结算顺序问题。', 'Fixed an ordering issue that could occur when card creation, card copying, and an end-of-turn effect happened on the same frame.']],
  [['修复了部分遗物效果在以非通常方式获得临时能量后，数字预览延迟更新的问题。', 'Fixed some relic number previews updating late after temporary Energy was gained in an unusual way.']],
  [['修复了在超宽屏下，某些确认弹窗的焦点会落到不可见按钮上的问题。', 'Fixed focus landing on an invisible button in some confirmation dialogs at ultrawide resolutions.']]
];
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
    Boolean(labels[v.id] || labels[v.kind]) && !/^(If|Condition|Chance)/.test(v.id) &&
    !(v.id === 'Cards' && /(?:大于等于|at least)\s*\{Cards:/i.test(card.descZh + card.descEn)));
}
function variableLabel(card, variable) {
  if (variable.id === 'Cards') {
    if (/(?:抽|Draw)\s*\{Cards:/i.test(card.descZh + card.descEn)) return ['抽牌数', 'cards drawn'];
    if (/(?:丢弃|Discard)\s*\{Cards:/i.test(card.descZh + card.descEn)) return ['弃牌数', 'cards discarded'];
  }
  return labels[variable.id] || labels[variable.kind];
}
function changeCard(card) {
  const vars = candidateVars(card);
  if (!vars.length) return null;
  const variable = pick(vars);
  const direction = variable.kind === 'HpLoss' ? pick([-1, -1, 1]) : pick([1, 1, -1]);
  const nextBase = numericStep(variable.base, direction, variable.kind);
  if (nextBase === variable.base) return null;
  const delta = nextBase - variable.base;
  const nextUp = Math.max(1, variable.up + delta);
  const label = variableLabel(card, variable) || [variable.id.replace(/([a-z])([A-Z])/g, '$1 $2'), variable.id.replace(/([a-z])([A-Z])/g, '$1 $2')];
  const benefit = variable.kind === 'HpLoss' ? direction < 0 : direction > 0;
  return { kind: 'number', card, variable, label, old: valuePair(variable.base, variable.up),
    next: valuePair(nextBase, nextUp), benefit, thought: Math.random() < .23 ?
      pick(benefit ? (thoughts[variable.kind] || thoughts.default) : nerfThoughts) : null };
}
function changeKeyword(card) {
  const hasExhaust = card.keywords.includes('Exhaust');
  const upgradedHasExhaust = card.upKeywords.includes('Exhaust');
  const upgradedOnly = Math.random() < .43;
  const old = upgradedOnly ? upgradedHasExhaust : hasExhaust;
  const text = old
    ? (upgradedOnly ? ['升级后不再消耗。', 'The upgraded version no longer Exhausts.'] : ['不再消耗。', 'No longer Exhausts.'])
    : (upgradedOnly ? ['升级后改为消耗。', 'The upgraded version now Exhausts.'] : ['现在会消耗。', 'Now Exhausts.']);
  const thought = old ?
    (upgradedOnly ? ['我们希望升级后的牌在多回合战斗中有更明确的价值，但仍要付出抽到它的机会成本。', 'We want the upgraded card to offer a clearer payoff in longer fights while still costing a draw.'] :
      ['移除消耗后，这张牌应该能在较长的战斗中找到更稳定的用途。', 'Removing Exhaust should give this card a steadier role in longer fights.']) :
    ['这张牌在反复打出时收益过高。让它消耗应该能保留爆发回合，同时减少循环中的压力。', 'Repeated plays were paying off too much. Exhaust should keep the burst turn while easing the pressure in loops.'];
  return {kind:'keyword', card, text, thought: Math.random() < .35 ? thought : null};
}
function changeUpgrade(card) {
  const vars = candidateVars(card);
  if (vars.length && Math.random() < .7) {
    const variable = pick(vars);
    const direction = variable.kind === 'HpLoss' ? -1 : 1;
    const next = numericStep(variable.up, direction, variable.kind);
    if (next !== variable.up) {
      const label = variableLabel(card, variable);
      return {kind:'upgrade', card, label, old:String(variable.up), next:String(next),
        thought: pick([
          ['此前升级这张牌的收益不够明显。我们希望这次调整能让升级成为一个更有竞争力的选择。', 'The upgrade was not offering enough. We want this to make upgrading the card a more competitive choice.'],
          ['基础版本在当前强度下已经能发挥作用，因此这次只调整升级后的效果。', 'The base card is doing its job, so this pass only changes the upgraded effect.']
        ])};
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
  const next = numericStep(variable.base, variable.kind === 'HpLoss' ? -1 : 1, variable.kind);
  if (next === variable.base) return null;
  return {kind:'baseOnly', card, label: variableLabel(card, variable),
    old:String(variable.base), next:String(next),
    thought:['基础版本的表现落后于升级版本，因此这次只提高未升级时的数值。', 'The base card was lagging behind its upgrade, so this change only raises the unupgraded value.']};
}
function changeDiverse(card) {
  const choices = ['number', 'number', 'number', 'upgrade', 'baseOnly'];
  if (card.type === 'Attack' || card.type === 'Skill') choices.push('keyword');
  const kind = pick(choices);
  return kind === 'keyword' ? changeKeyword(card) :
    kind === 'upgrade' ? (changeUpgrade(card) || changeCard(card)) :
    kind === 'baseOnly' ? (changeBaseOnly(card) || changeCard(card)) : changeCard(card);
}
function cleanDescription(template, card, lang) {
  const variables = Object.fromEntries(card.vars.map(v => [v.id, v]));
  return template.replace(/\[\/?[a-zA-Z]+\]/g, '').replace(/\{([^{}:]+):([^{}]+)\}/g, (_, id, modifier) => {
    const v = variables[id];
    if (!v) return '';
    if (modifier.startsWith('plural:')) return v.base === 1 ? modifier.slice(7).split('|')[0] : modifier.slice(7).split('|')[1] || '';
    return valuePair(v.base, v.up);
  }).replace(/\{singleStarIcon\}/g, lang === 'zh' ? ' 颗星星' : ' Stars')
    .replace(/\s+/g, ' ').trim();
}
function makeRework(card) {
  const bank = wordBanks[card.pool];
  const effectTypes = {
    Ironclad: ['Skill', 'Attack', 'Skill'], Silent: ['Skill', 'Attack', 'Skill'],
    Regent: ['Skill', 'Attack', 'Skill'], Necrobinder: ['Attack', 'Skill', 'Skill'],
    Defect: ['Attack', 'Skill', 'Power'], Colorless: ['Skill', 'Skill', 'Skill']
  };
  const compatible = bank.effects.filter((_, index) => effectTypes[card.pool][index] === card.type);
  const effect = pick(compatible.length ? compatible : bank.effects);
  return { kind: 'rework', card, old: [cleanDescription(card.descZh, card, 'zh'), cleanDescription(card.descEn, card, 'en')], next: effect,
    thought: pick([
      ['我们希望它有更明确的构筑方向，同时保留原本的主题。', 'We want this to point toward a clearer build while keeping the card’s original theme.'],
      ['旧版本很难在合适的时机发挥作用，所以我们尝试了更直接的效果。', 'The old version had trouble finding the right moment, so we’re trying a more direct effect.'],
      ['这是一次幅度较大的实验，欢迎告诉我们它在实战中的表现。', 'This is a larger experiment; please let us know how it plays in real runs.']
    ]) };
}
function makeNew(pool) {
  const bank = wordBanks[pool];
  const index = rand(0, bank.names.length - 1);
  return { kind: 'new', pool, name: bank.names[index], effect: bank.effects[index],
    thought: pick([
      ['我们想给这一角色再添一种围绕其核心资源构筑的选择。', 'We wanted another build option around this character’s core resource.'],
      ['这张牌旨在连接已有的两种玩法，具体强度还需要更多测试。', 'This card aims to connect two existing play patterns; its exact power still needs more testing.']
    ]) };
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
    c.rarity !== 'Basic' && ['Attack', 'Skill'].includes(c.type) && c.descEn.length < 190 &&
    !/[{}]/.test(cleanDescription(c.descEn, c, 'en')) &&
    !/[{}]/.test(cleanDescription(c.descZh, c, 'zh'))));
  if (reworkCard) { entries[reworkPool].splice(rand(0, entries[reworkPool].length), 0, makeRework(reworkCard)); used.add(reworkCard.en); }
  if (Math.random() < .18) {
    const newPool = pick(pools);
    entries[newPool].push(makeNew(newPool));
    if (Math.random() < .08) {
      const secondPool = pick(pools.filter(p => p !== newPool));
      entries[secondPool].push(makeNew(secondPool));
    }
  }
  if (Math.random() < .34) {
    const removePool = pick(pools.slice(0, 5));
    const removable = catalog.filter(c => c.pool === removePool && !used.has(c.en) && c.rarity === 'Uncommon');
    if (removable.length) entries[removePool].push({ kind: 'remove', card: pick(removable),
      thought: ['这张牌目前与该角色的其他选择过于相似。我们会观察移除后牌池的表现。', 'This card currently overlaps too much with other options for this character. We’ll watch how the pool feels without it.'] });
  }
  const ancients = shuffle(ancientReferences).slice(0, rand(1, 2)).map(item => {
    const direction = Math.random() < .65 ? (item.benefit ? 1 : -1) : (item.benefit ? -1 : 1);
    const next = numericStep(item.base, direction, item.stat[1]);
    return { ...item, old: valuePair(item.base, item.up || item.base),
      next: valuePair(next, item.up ? item.up + next - item.base : next),
      buff: direction * (item.benefit ? 1 : -1) > 0 };
  });
  patch = { intro: pick(intros), bridge: pick(bridges), ending: pick(endings), entries, ancients,
    general: Math.random() < .8 ? shuffle(generalChanges).slice(0, rand(1, 2)) : [],
    enemies: shuffle(enemyChanges).slice(0, rand(2, 4)),
    ux: shuffle(uxLines).slice(0, rand(3, 5)), bugs: shuffle(bugs).slice(0, rand(6, 9)),
    modding: shuffle(modLines).slice(0, rand(2, 4)), likes: rand(420, 2700), comments: rand(55, 430) };
  liked = false;
  disliked = false;
  render();
  $('landing').classList.add('hidden');
  $('article-shell').classList.remove('hidden');
}
function lineFor(entry) {
  if (entry.kind === 'new') {
    const name = escapeHtml(tr(entry.name)), effect = escapeHtml(tr(entry.effect));
    return '<li>' + (language === 'zh' ? '新增卡牌 <strong>' : 'Added <strong>') + name + '</strong>: <em>' + effect + '</em></li>' + thoughtFor(entry);
  }
  const name = escapeHtml(language === 'zh' ? entry.card.zh : entry.card.en);
  if (entry.kind === 'remove')
    return '<li>' + (language === 'zh' ? '移除卡牌 <strong>' : 'Removed <strong>') + name + '</strong>.</li>' + thoughtFor(entry);
  if (entry.kind === 'rework')
    return '<li>' + (language === 'zh' ? '重做 <strong>' : 'Reworked <strong>') + name + '</strong>: “' +
      escapeHtml(tr(entry.old)) + '” → “' + escapeHtml(tr(entry.next)) + '”</li>' + thoughtFor(entry);
  if (entry.kind === 'keyword') return '<li>' + (language === 'zh' ? '调整 <strong>' : 'Changed <strong>') +
    name + '</strong>: ' + escapeHtml(tr(entry.text)) + '</li>' + thoughtFor(entry);
  if (['upgrade','upgradeCost','baseOnly'].includes(entry.kind)) {
    const prefix = entry.kind === 'baseOnly' ? ['未升级版本','unupgraded version'] : ['升级版本','upgraded version'];
    const label = entry.kind === 'upgradeCost' ? ['耗能','cost'] : entry.label;
    return '<li>' + (language === 'zh' ? '增强 <strong>' : 'Buffed <strong>') + name + '</strong>: ' +
      escapeHtml(tr(prefix)) + ' ' + escapeHtml(tr(label)) + ' ' +
      (language === 'zh' ? '由 ' : 'changed from ') + entry.old + ' → ' + entry.next + '</li>' + thoughtFor(entry);
  }
  const label = escapeHtml(tr(entry.label));
  const verb = language === 'zh' ? (entry.benefit ? '增强' : '削弱') : (entry.benefit ? 'Buffed' : 'Nerfed');
  const change = language === 'zh' ? label + '从 ' + entry.old + ' → ' + entry.next :
    label + ' changed from ' + entry.old + ' → ' + entry.next;
  return '<li>' + verb + ' <strong>' + name + '</strong>: ' + escapeHtml(change) + '</li>' + thoughtFor(entry);
}
function thoughtFor(entry) { return entry.thought ? '<li class="thought">' + escapeHtml(tr(entry.thought)) + '</li>' : ''; }
function list(lines) { return '<ul>' + lines.map(line => '<li>' + escapeHtml(tr(line)) + '</li>').join('') + '</ul>'; }
function enemyLine(item) {
  const name = escapeHtml(tr(item.name));
  if (item.kind === 'intent') return '<li>' + (language === 'zh' ? '调整 <strong>' : 'Changed <strong>') + name +
    '</strong>: ' + escapeHtml(tr(item.text)) + '</li>';
  const stat = item.kind === 'hp' ? ['生命值', 'HP'] : item.kind === 'strength' ? ['力量增益', 'Strength gain'] :
    item.kind === 'galvanic' ? ['电流增益', 'Galvanic power'] : ['伤害', 'damage'];
  const move = item.move ? escapeHtml(tr(item.move)) + ' ' : '';
  return '<li>' + (language === 'zh' ? '调整 <strong>' : 'Changed <strong>') + name + '</strong>: ' +
    move + escapeHtml(tr(stat)) + (language === 'zh' ? '（低/高进阶）由 ' : ' at low/high Ascension from ') +
    item.old + ' → ' + item.next + '</li>';
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
  $('dislike-button').setAttribute('aria-label', tr(ui.dislike));
  if (!patch) return;
  let html = '<p>' + escapeHtml(tr(patch.intro)) + '</p><p>' + escapeHtml(tr(patch.bridge)) + '</p>';
  html += '<h2>' + tr(ui.content) + '</h2>';
  if (patch.general.length) html += '<h3>' + tr(ui.general) + ':</h3>' + list(patch.general);
  html += '<h3>' + (language === 'zh' ? '先古之民:' : 'Ancients:') + '</h3><ul>';
  html += patch.ancients.map(item => '<li>' + (language === 'zh' ? (item.buff ? '增强 ' : '削弱 ') :
    (item.buff ? 'Buffed ' : 'Nerfed ')) + '<strong>' + escapeHtml(language === 'zh' ? item.zh : item.name) + '</strong>: ' +
    escapeHtml(tr(item.stat)) + (language === 'zh' ? '从 ' : ' changed from ') + item.old + ' → ' + item.next + '</li>').join('');
  html += '</ul>';
  html += '<h3>' + tr(ui.enemies) + ':</h3><ul>' + patch.enemies.map(enemyLine).join('') + '</ul>';
  for (const pool of pools) {
    html += '<h3>' + tr(poolNames[pool]) + ':</h3><ul>';
    html += patch.entries[pool].map(lineFor).join('');
    html += '</ul>';
  }
  html += '<h2>' + tr(ui.ux) + '</h2><h3>' + tr(ui.general) + ':</h3>' + list(patch.ux);
  html += '<h2>' + tr(ui.bugs) + '</h2>' + list(patch.bugs.map(x => x[0]));
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
$('share-button').addEventListener('click', async () => {
  const button = $('share-button');
  button.disabled = true;
  try {
    const article = $('article-content');
    const canvas = await html2canvas(article, {
      backgroundColor: '#292c32', scale: 2, useCORS: true,
      windowWidth: Math.max(window.innerWidth, 900),
      onclone: clonedDocument => {
        const clone = clonedDocument.getElementById('article-content');
        clone.style.width = '720px';
        clone.style.padding = '18px 20px 25px';
        clone.style.background = '#292c32';
        clone.style.fontSize = '15px';
        clone.style.lineHeight = '1.42';
      }
    });
    const anchor = document.createElement('a');
    anchor.download = `Next-STS2-Patch-v0.112.0-${language}.png`;
    anchor.href = canvas.toDataURL('image/png');
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    $('share-label').textContent = tr(ui.copied);
    setTimeout(() => $('share-label').textContent = tr(ui.share), 2500);
  } catch (error) {
    console.error('Image export failed:', error);
    $('share-label').textContent = language === 'zh' ? '导出失败' : 'Export failed';
  } finally {
    button.disabled = false;
  }
});
fetch('cards.json').then(response => {
  if (!response.ok) throw new Error('Card catalog unavailable');
  return response.json();
}).then(data => { catalog = data; $('generate-main').disabled = false; }).catch(() => {
  $('generate-main').disabled = true;
  $('generate-main').textContent = language === 'zh' ? '卡牌数据加载失败' : 'Card data unavailable';
});
$('generate-main').disabled = true;
render();
