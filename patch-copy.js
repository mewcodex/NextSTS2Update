/* Small, bilingual sentence grammars for the less data-driven patch sections. */
const patchCopy = (() => {
  const pick = values => values[Math.floor(Math.random() * values.length)];
  const join = (...parts) => [parts.map(part => part[0]).join(''), parts.map(part => part[1]).join(' ')];
  const introLead = [
    ['又到了 Beta 更新的时候，爬塔者们！', 'Another beta patch is here, Slayers!'],
    ['大家好，新一轮 Beta 更新来了！', 'Hi everyone, another beta update is live!'],
    ['塔里的工作仍在继续。', 'Work on the Spire continues.'],
    ['假期过后，我们又回到更新节奏了。', 'We are back to our patch routine after the break.'],
    ['这周我们继续处理大家在 Beta 分支遇到的问题。', 'This week we are looking at more of the issues you found on the beta branch.']
  ];
  const introFocus = [
    ['这次主要调整了一些卡牌，并处理了几处战斗中的边缘情况。', 'This round adjusts a few cards and clears up some edge cases in combat.'],
    ['本轮有平衡性调整、卡牌改动和一批较难复现的修复。', 'There are balance changes, card updates, and a batch of hard-to-reproduce fixes.'],
    ['我们仍在观察不同构筑的表现，这次先对几项数值进行试验。', 'We are still watching how different builds perform, and this patch tries a few number changes.'],
    ['除了卡牌之外，敌人和遗物也有一些值得测试的变化。', 'Alongside the cards, there are a few enemy and relic changes worth testing.'],
    ['部分旧牌找到了新的方向，界面和模组制作方面也有一些小改进。', 'Some familiar cards have a new direction, alongside small interface and modding improvements.'],
    ['我们根据最近的反馈调整了一些回报偏低的选择。', 'We made a few changes to choices whose payoff felt low based on recent feedback.']
  ];
  const introClose = [
    ['请继续告诉我们这些改动在实际对局中的表现。', 'Please keep telling us how these changes feel in actual runs.'],
    ['Beta 分支的改动仍可能继续调整，欢迎发送反馈。', 'Changes on the beta branch can still move around, so keep the feedback coming.'],
    ['我们会继续留意大家的测试反馈。', 'We will keep an eye on your testing feedback.'],
    ['希望这轮改动能带来一些新的尝试。', 'We hope this round gives you a few new things to try.']
  ];
  const bridges = [
    ['下面进入更新详情！', 'On to the patch notes!'],
    ['和往常一样，我们会继续留意反馈。详细改动如下。', 'As always, we will keep reading your feedback. Here are the details.'],
    ['如果遇到意料之外的互动，请通过游戏内工具告诉我们。', 'If you run into an unexpected interaction, please let us know through the in-game tool.']
  ];
  const endings = [
    ['感谢大家继续测试 Beta 分支！', 'Thanks for continuing to test the beta branch!'],
    ['祝你爬塔顺利，我们下次更新见！', 'Good luck climbing, and we will see you next patch!'],
    ['我们会继续关注这些改动的表现。', 'We will keep an eye on how these changes play out.']
  ];
  const endingExtras = [
    ['欢迎继续通过游戏内反馈工具分享你的体验。', 'Please keep sharing your experience through the in-game feedback tool.'],
    ['如果发现新的问题，也请告诉我们。', 'Let us know if you spot anything new.'],
    ['感谢大家的耐心与反馈。', 'Thanks for your patience and feedback.']
  ];

  function intro() { return join(pick(introLead), pick(introFocus), pick(introClose)); }
  function bridge() { return pick(bridges); }
  function ending() { return join(pick(endings), pick(endingExtras)); }

  const rooms = [
    ['休息处', 'Rest Sites'], ['？房间', '? rooms'], ['普通战斗房间', 'normal combat rooms']
  ];
  function general(kind = pick(['merchant', 'map', 'reward'])) {
    if (kind === 'merchant') {
      const initial = Math.random() < .5;
      const amount = initial ? [100, pick([125, 150])] : [50, pick([25, 75])];
      return initial ?
        [`进阶6“通货膨胀”下，商人移除卡牌的初始费用从${amount[0]}金币调整至${amount[1]}金币。`,
          `At Ascension 6, Inflation changes the initial merchant card removal cost from ${amount[0]} to ${amount[1]} Gold.`] :
        [`进阶6“通货膨胀”下，商人每次移除卡牌后的费用增幅从${amount[0]}金币调整至${amount[1]}金币。`,
          `At Ascension 6, Inflation changes the merchant card removal cost increase after each removal from ${amount[0]} to ${amount[1]} Gold.`];
    }
    if (kind === 'map') {
      const room = pick(rooms), direction = pick([['增加', 'increased'], ['减少', 'decreased']]);
      return [`略微${direction[0]}了地图上${room[0]}的数量。`, `Slightly ${direction[1]} the number of ${room[1]} on the map.`];
    }
    const reward = pick([['精英战斗后的', 'after Elite combats'], ['首领战斗后的', 'after Boss combats'], ['第三幕', 'in Act 3']]);
    const rarity = pick([['稀有牌', 'Rare cards'], ['罕见牌', 'Uncommon cards']]);
    const direction = pick([['提高', 'increased'], ['降低', 'decreased']]);
    return [`略微${direction[0]}了${reward[0]}卡牌奖励中${rarity[0]}的出现概率。`,
      `Slightly ${direction[1]} the chance of ${rarity[1]} appearing in card rewards ${reward[1]}.`];
  }
  function event() {
    const kind = pick(['mushrooms', 'wongo', 'tinker']);
    if (kind === 'mushrooms') {
      const next = pick([3, 4]);
      return [`加强了蘑菇饥渴事件：“芳香蘑菇”选项升级的卡牌数量从2张提升至${next}张。`,
        `Buffed Hungry for Mushrooms: the Fragrant Mushroom option now upgrades ${next} cards instead of 2.`];
    }
    if (kind === 'wongo') {
      const combat = pick([['精英战斗', 'Elite combats'], ['首领战斗', 'Boss combats'], ['普通战斗', 'normal combats']]);
      return [`修改了欢迎来到旺购百货事件：“旺购的神秘盲盒”现在也会在${combat[0]}后推进计数。`,
        `Changed Welcome to Wongo's: the Mystery Box now also progresses after ${combat[1]}.`];
    }
    const detail = pick([
      ['本回合可以免费打出', 'free to play this turn'],
      ['生成时的临时耗能', 'the temporary cost when created'],
      ['加入手牌的时机', 'when they enter your Hand']
    ]);
    return [`修改了打造时间事件：“混沌”选项生成的牌现在会更明确地标明${detail[0]}。`,
      `Changed Tinker Time: cards created by the Chaos option now more clearly indicate ${detail[1]}.`];
  }

  const bugParts = {
    general: {
      trigger: [
        ['连续生成并消耗卡牌', 'cards were created and Exhausted in quick succession'],
        ['临时耗能变化与升级同时发生', 'temporary cost changes and upgrades happened together'],
        ['快速切换战斗目标', 'switching combat targets quickly'],
        ['战斗结束后立即打开奖励界面', 'opening the reward screen immediately after combat'],
        ['连续触发多个回合结束效果', 'several end-of-turn effects resolved in succession']
      ],
      subject: [
        ['卡牌预览', 'card previews'], ['部分遗物提示', 'some relic tooltips'],
        ['战斗记录', 'the combat log'], ['奖励描述', 'reward descriptions']
      ],
      issue: [
        ['偶尔显示过时数值', 'occasionally showing outdated values'],
        ['未及时刷新', 'sometimes failing to refresh immediately'],
        ['短暂沿用上一项的文本', 'briefly retaining text from the previous selection']
      ]
    },
    enemies: {
      trigger: [
        ['敌人多段攻击被中途打断', 'an enemy multi-hit attack was interrupted'],
        ['敌人同一回合获得多种状态', 'an enemy gained several statuses in the same turn'],
        ['目标在攻击结算中途死亡', 'the target died partway through an attack'],
        ['敌人行动与回合结束效果同时结算', 'an enemy move and an end-of-turn effect resolved together']
      ],
      subject: [
        ['敌人意图图标', 'enemy intent icons'], ['下一动作预览', 'the next-move preview'],
        ['伤害数字', 'damage numbers']
      ],
      issue: [
        ['偶尔显示旧数值', 'occasionally showing an old value'],
        ['可能延迟刷新', 'sometimes refreshing late'],
        ['短暂显示错误信息', 'briefly showing incorrect information']
      ]
    },
    multiplayer: {
      trigger: [
        ['队友断线后重新连接', 'a teammate reconnected'],
        ['两名玩家同时结束回合', 'two players ended their turns together'],
        ['一名玩家打出其他角色的牌', 'a player used a card from another character'],
        ['队友快速切换奖励选项', 'a teammate switched reward choices quickly']
      ],
      subject: [
        ['队友的卡牌预览', 'teammate card previews'], ['地图投票提示', 'map vote indicators'],
        ['共享奖励描述', 'shared reward descriptions'], ['战斗记录', 'the combat log']
      ],
      issue: [
        ['偶尔不同步', 'occasionally falling out of sync'],
        ['短暂显示过时信息', 'briefly showing outdated information'],
        ['未及时更新', 'sometimes failing to update immediately']
      ]
    }
  };
  const multiplayerSubjectsByTrigger = [[0, 1, 2, 3], [0, 3], [0, 3], [0, 2]];
  function bug(category) {
    const parts = bugParts[category];
    const triggerIndex = Math.floor(Math.random() * parts.trigger.length);
    const trigger = parts.trigger[triggerIndex];
    const subjects = category === 'multiplayer' ? multiplayerSubjectsByTrigger[triggerIndex].map(index => parts.subject[index]) : parts.subject;
    const subject = pick(subjects), issue = pick(parts.issue);
    return [`修复了在${trigger[0]}时，${subject[0]}${issue[0]}的问题。`,
      `Fixed ${subject[1]} ${issue[1]} when ${trigger[1]}.`];
  }

  const uxSurfaces = [
    { name: ['卡牌预览', 'card previews'], actions: [['快速切换卡牌', 'switching cards quickly'], ['使用手柄导航', 'navigating with a controller'], ['关闭后重新打开预览', 'closing and reopening a preview']] },
    { name: ['奖励界面', 'the reward screen'], actions: [['快速切换选项', 'switching choices quickly'], ['使用手柄导航', 'navigating with a controller'], ['关闭后重新打开奖励界面', 'closing and reopening it']] },
    { name: ['战斗记录', 'the combat log'], actions: [['快速滚动记录', 'scrolling quickly'], ['使用手柄导航', 'navigating with a controller'], ['关闭后重新打开记录', 'closing and reopening it']] },
    { name: ['地图界面', 'the map screen'], actions: [['快速切换路线节点', 'switching route nodes quickly'], ['使用手柄导航', 'navigating with a controller'], ['关闭后重新打开地图', 'closing and reopening it']] }
  ];
  function ux() {
    if (Math.random() < .5) {
      const surface = pick(uxSurfaces).name;
      const condition = pick([['较窄窗口', 'narrow windows'], ['较高界面缩放比例', 'higher UI scale settings'], ['超宽屏', 'ultrawide displays']]);
      const aspect = pick([['文本换行', 'text wrapping'], ['布局', 'layout'], ['滚动位置', 'scroll position']]);
      return [`改善了${surface[0]}在${condition[0]}下的${aspect[0]}。`,
        `Improved ${aspect[1]} for ${surface[1]} on ${condition[1]}.`];
    }
    const surface = pick(uxSurfaces);
    const action = pick(surface.actions);
    const aspect = pick([['焦点位置', 'focus placement'], ['选中状态', 'selection highlighting']]);
    return [`调整了${surface.name[0]}在${action[0]}时的${aspect[0]}。`,
      `Adjusted ${aspect[1]} for ${surface.name[1]} when ${action[1]}.`];
  }

  const modObjects = [
    ['自定义卡牌描述', 'custom card descriptions'], ['自定义遗物提示', 'custom relic tooltips'],
    ['模组注册内容', 'registered mod content'], ['自定义状态效果', 'custom status effects']
  ];
  function modding() {
    const kind = pick(['refresh', 'diagnostics', 'reload']);
    if (kind === 'refresh') {
      const object = pick(modObjects.slice(0, 2));
      const cause = pick([['动态数值变化', 'dynamic values changed'], ['语言切换', 'the language changed'], ['内容重新加载', 'content was reloaded']]);
      return [`改善了${object[0]}在${cause[0]}时的刷新时机。`,
        `Improved refresh timing for ${object[1]} when ${cause[1]}.`];
    }
    if (kind === 'diagnostics') {
      const issue = pick([['缺失本地化键', 'missing localization keys'], ['重复注册的内容', 'duplicate content registrations'], ['无效资源路径', 'invalid resource paths']]);
      const detail = pick([['相关模组名称', 'the related mod name'], ['内容标识符', 'the content identifier'], ['失败阶段', 'the failure stage']]);
      return [`模组诊断日志现在会在发现${issue[0]}时显示${detail[0]}。`,
        `Mod diagnostics now show ${detail[1]} when ${issue[1]} are found.`];
    }
    const object = pick(modObjects);
    const cause = pick([['重新加载模组', 'reloading mods'], ['同时启用多个模组', 'enabling several mods together'], ['切换语言', 'switching languages']]);
    return [`减少了${cause[0]}时对${object[0]}的重复检查。`,
      `Reduced duplicate checks of ${object[1]} when ${cause[1]}.`];
  }

  function writing() {
    const target = pick([['临时耗能变化', 'temporary cost changes'], ['回合结束效果', 'end-of-turn effects'],
      ['多段攻击', 'multi-hit attacks'], ['由队友触发的效果', 'effects triggered by teammates']]);
    const surface = pick([['卡牌描述', 'card descriptions'], ['遗物提示', 'relic tooltips'], ['战斗记录', 'the combat log']]);
    const action = pick([['统一了', 'Standardized'], ['明确了', 'Clarified']]);
    return [`${action[0]}${target[0]}在${surface[0]}中的表述。`, `${action[1]} how ${target[1]} are described in ${surface[1]}.`];
  }
  function localization() {
    const language = pick([['中文', 'Chinese'], ['部分语言', 'several languages']]);
    const surface = pick([['敌人意图说明', 'enemy intent descriptions'], ['卡牌预览', 'card previews'],
      ['遗物提示', 'relic tooltips'], ['事件选项', 'event choices']]);
    const issue = pick([['标点与换行', 'punctuation and line breaks'], ['少数未翻译的关键词', 'a few untranslated keywords'],
      ['部分数值的显示格式', 'formatting for some values']]);
    return [`修正了${language[0]}${surface[0]}中的${issue[0]}。`,
      `Corrected ${issue[1]} in ${language[1]} ${surface[1]}.`];
  }
  const cardPayoffs = {
    Damage: ['伤害', 'damage'], Block: ['防御收益', 'defensive payoff'],
    Energy: ['能量收益', 'Energy gain'], Cards: ['抽牌收益', 'card draw'],
    Draw: ['抽牌收益', 'card draw'], Gold: ['金币收益', 'Gold payoff']
  };
  function cardThought(variable, benefit, scope = 'both') {
    const payoff = cardPayoffs[variable?.kind] || ['效果', 'effect'];
    const stage = scope === 'upgrade' ? ['升级后', 'after upgrading'] :
      scope === 'base' ? ['未升级时', 'before upgrading'] : ['在更多对局中', 'in more runs'];
    if (benefit) {
      const reason = pick([
        [`我们希望这张牌${stage[0]}能提供更明确的${payoff[0]}。`, `We want this card to offer a clearer ${payoff[1]} ${stage[1]}.`],
        [`此前的${payoff[0]}略低于预期，先试着提高这一数值。`, `The ${payoff[1]} was a little below where we wanted it, so we are trying a higher number.`],
        [`这项调整应该让${payoff[0]}与使用条件更匹配。`, `This should make the ${payoff[1]} better match the conditions needed to use it.`]
      ]);
      return reason;
    }
    return pick([
      [`这张牌的${payoff[0]}在部分构筑中过于稳定，我们想留出更多选择空间。`, `The ${payoff[1]} was too reliable in some builds, and we want to leave more room for other choices.`],
      [`我们会观察降低${payoff[0]}后，这张牌是否仍能保留原本的用途。`, `We will watch whether this card keeps its role after reducing its ${payoff[1]}.`],
      [`这次先小幅收回${payoff[0]}，看看它与其他选择的差距会如何变化。`, `We are pulling back the ${payoff[1]} a little and watching how it compares with other options.`]
    ]);
  }
  function reworkThought() {
    const aim = pick([
      ['让这张牌在更多牌组中找到位置', 'find a place in more decks'],
      ['给它一个更明确的构筑方向', 'give it a clearer build direction'],
      ['让它的使用时机更容易判断', 'make its timing easier to judge']
    ]);
    const caveat = pick([
      ['我们会继续关注实战中的表现。', 'We will keep watching how it plays in actual runs.'],
      ['这仍是一次实验，欢迎告诉我们你的体验。', 'This is still an experiment, so please tell us how it feels.'],
      ['如果它偏离预期，我们还会继续调整。', 'We will keep adjusting it if it misses the mark.']
    ]);
    return [`我们希望${aim[0]}。${caveat[0]}`, `We want this change to ${aim[1]}. ${caveat[1]}`];
  }
  function newThought(pool) {
    const colorless = pool === 'Colorless';
    const purpose = colorless ? pick([
      ['为不同牌组提供新的选择', 'offer a new option to different decks'],
      ['带来一种不依赖特定角色的互动', 'create an interaction that can fit in several decks'],
      ['给无色牌池增加一种新的用途', 'add another use to the Colorless pool']
    ]) : pick([
      ['补充这一角色已有的构筑路线', 'add to this character’s existing build paths'],
      ['连接这一角色的两种常见玩法', 'connect two of this character’s familiar play patterns'],
      ['给这一角色的核心资源增加一种用法', 'offer another use for this character’s core resource']
    ]);
    const caveat = pick([
      ['我们会观察它在实战中的强度。', 'We will watch how strong it is in actual runs.'],
      ['欢迎告诉我们它与现有卡牌的互动是否有趣。', 'Please tell us how it interacts with the existing cards.'],
      ['它的具体数值仍可能继续调整。', 'Its exact numbers may still change.']
    ]);
    return [`我们希望${purpose[0]}。${caveat[0]}`, `We want this card to ${purpose[1]}. ${caveat[1]}`];
  }
  return { intro, bridge, ending, general, event, bug, ux, modding, writing, localization,
    cardThought, reworkThought, newThought };
})();
