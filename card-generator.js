/* A small offline subset of chaosmod's shell + component assembly approach. */
const cardEffectGenerator = (() => {
  const pickOne = values => values[Math.floor(Math.random() * values.length)];
  const range = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pair = (base, up) => `${base}(${up})`;
  const component = (id, types, render, singleTarget = false) => ({ id, types, render, singleTarget });

  // All cores expose an improved value on upgrade. Riders are independent
  // native-style effect atoms; their legal card types and owners are explicit.
  const cores = {
    Attack: [
      component('deal.damage', ['Attack'], cost => {
        const base = cost === 0 ? range(3, 5) : cost === 2 ? range(12, 16) : range(7, 11);
        const amount = pair(base, base + (cost === 2 ? range(4, 6) : range(2, 4)));
        return [`造成${amount}点伤害。`, `Deal ${amount} damage.`];
      }),
      component('deal.damage.all', ['Attack'], cost => {
        const base = cost === 2 ? range(7, 10) : range(4, 6);
        const amount = pair(base, base + range(2, 3));
        return [`对所有敌人造成${amount}点伤害。`, `Deal ${amount} damage to ALL enemies.`];
      })
    ],
    Skill: [
      component('gain.block', ['Skill'], cost => {
        const base = cost === 0 ? range(3, 5) : cost === 2 ? range(11, 15) : range(6, 9);
        const amount = pair(base, base + range(2, 4));
        return [`获得${amount}点格挡。`, `Gain ${amount} Block.`];
      }),
      component('draw.cards', ['Skill'], cost => {
        const base = cost === 2 ? 2 : 1;
        return [`抽${pair(base, base + 1)}张牌。`, `Draw ${pair(base, base + 1)} cards.`];
      })
    ]
  };
  const riders = {
    General: [
      component('gain.block.on.attack', ['Attack'], () => ['若目标拥有易伤，获得4点格挡。', 'If the target is Vulnerable, gain 4 Block.'], true),
      component('draw.after.block', ['Skill'], () => ['若你本回合打出过攻击牌，抽1张牌。', 'If you played an Attack this turn, draw 1 card.']),
      component('exhaust.this', ['Attack', 'Skill'], () => ['消耗。', 'Exhaust.'])
    ],
    Ironclad: [
      component('exhaust.hand', ['Skill'], () => ['消耗1张手牌。获得1点力量。', 'Exhaust 1 card from your Hand. Gain 1 Strength.']),
      component('scale.exhaust', ['Attack'], () => ['本场战斗中每消耗过1张牌，额外造成1点伤害。', 'Deal 1 additional damage for each card you have Exhausted this combat.']),
      component('self.hp.loss', ['Attack', 'Skill'], () => ['失去2点生命值。获得1点能量。', 'Lose 2 HP. Gain 1 Energy.'])
    ],
    Silent: [
      component('apply.poison', ['Attack', 'Skill'], () => ['施加2层中毒。', 'Apply 2 Poison.'], true),
      component('create.shiv', ['Skill'], () => ['将1张小刀加入你的手牌。', 'Add 1 Shiv to your Hand.']),
      component('discard.draw', ['Skill'], () => ['弃置1张牌，然后抽1张牌。', 'Discard 1 card, then draw 1 card.']),
      component('conditional.poison', ['Attack'], () => ['若目标已中毒，额外造成4点伤害。', 'If the target is Poisoned, deal 4 additional damage.'], true)
    ],
    Regent: [
      component('gain.stars', ['Attack', 'Skill'], () => ['获得1点辉星。', 'Gain 1 Star.']),
      component('forge.blade', ['Attack', 'Skill'], () => ['铸造2。', 'Forge 2.']),
      component('conditional.stars', ['Attack'], () => ['若你拥有辉星，获得5点格挡。', 'If you have Stars, gain 5 Block.']),
      component('create.blade', ['Skill'], () => ['将1张君王之剑加入你的手牌。', 'Add 1 Sovereign Blade to your Hand.'])
    ],
    Necrobinder: [
      component('osty.block', ['Attack', 'Skill'], () => ['若奥斯提存活，获得5点格挡。', 'If Osty is alive, gain 5 Block.']),
      component('osty.damage', ['Skill'], () => ['若奥斯提存活，他对随机一名敌人造成6点伤害。', 'If Osty is alive, he deals 6 damage to a random enemy.']),
      component('create.soul', ['Attack', 'Skill'], () => ['将1张灵魂加入你的抽牌堆。', 'Add 1 Soul to your Draw Pile.']),
      component('apply.doom', ['Attack'], () => ['施加3层灾厄。', 'Apply 3 Doom.'], true)
    ],
    Defect: [
      component('channel.lightning', ['Attack', 'Skill'], () => ['生成1个闪电充能球。', 'Channel 1 Lightning Orb.']),
      component('channel.frost', ['Skill'], () => ['生成1个冰霜充能球。', 'Channel 1 Frost Orb.']),
      component('evoke.orb', ['Attack', 'Skill'], () => ['激发你最右侧的充能球。', 'Evoke your rightmost Orb.']),
      component('create.status', ['Attack'], () => ['将1张晕眩加入你的弃牌堆。', 'Add 1 Dazed to your Discard Pile.'])
    ],
    Colorless: [
      component('retain.card', ['Skill'], () => ['选择1张手牌，使其获得保留。', 'Choose 1 card in your Hand. It gains Retain.']),
      component('move.draw.pile', ['Skill'], () => ['将1张手牌放到抽牌堆顶部。', 'Put 1 card from your Hand on top of your Draw Pile.']),
      component('exhaust.hand.draw', ['Skill'], () => ['消耗1张手牌，然后抽1张牌。', 'Exhaust 1 card from your Hand, then draw 1 card.']),
      component('choose.colorless', ['Skill'], () => ['从3张随机无色牌中选择1张加入手牌。', 'Choose 1 of 3 random Colorless cards to add to your Hand.'])
    ]
  };
  const powers = {
    Ironclad: [
      n => [`每当你消耗1张牌时，获得${n}点格挡。`, `Whenever you Exhaust a card, gain ${n} Block.`],
      n => [`在你的回合开始时，获得${n}点力量。本回合结束时失去同等力量。`, `At the start of your turn, gain ${n} Strength. Lose that much Strength at the end of this turn.`]
    ],
    Silent: [
      n => [`每当你施加中毒时，对该敌人造成${n}点伤害。`, `Whenever you apply Poison, deal ${n} damage to that enemy.`],
      n => [`每当你弃置1张牌时，获得${n}点格挡。`, `Whenever you Discard a card, gain ${n} Block.`]
    ],
    Regent: [
      n => [`在你的回合开始时，获得${n}点辉星。`, `At the start of your turn, gain ${n} Stars.`],
      n => [`每当你铸造时，获得${n}点格挡。`, `Whenever you Forge, gain ${n} Block.`]
    ],
    Necrobinder: [
      n => [`每当奥斯提攻击时，获得${n}点格挡。`, `Whenever Osty attacks, gain ${n} Block.`],
      n => [`每当你打出1张灵魂时，对所有敌人造成${n}点伤害。`, `Whenever you play a Soul, deal ${n} damage to ALL enemies.`]
    ],
    Defect: [
      n => [`在你的回合开始时，生成${n}个闪电充能球。`, `At the start of your turn, Channel ${n} Lightning Orbs.`],
      n => [`每当你激发充能球时，获得${n}点格挡。`, `Whenever you Evoke an Orb, gain ${n} Block.`]
    ],
    Colorless: [
      n => [`每当你打出无色牌时，获得${n}点格挡。`, `Whenever you play a Colorless card, gain ${n} Block.`],
      n => [`在你的回合开始时，抽${n}张牌。`, `At the start of your turn, draw ${n} cards.`]
    ]
  };

  function generate(pool, type, costHint = null) {
    const cost = costHint !== null && costHint >= 0 && costHint <= 2 && Math.random() < .45
      ? costHint : type === 'Power' ? pickOne([1, 2]) : pickOne(type === 'Attack' ? [0, 1, 1, 2] : [0, 1, 1, 2]);
    if (type === 'Power') {
      const index = range(0, powers[pool].length - 1);
      const amount = pair(cost === 2 ? 2 : 1, cost === 2 ? 3 : 2);
      return { type, cost, upCost: cost, effect: powers[pool][index](amount), signature: `${pool}:Power:${index}:${cost}` };
    }
    const coreCandidates = cores[type].filter(atom => !(cost === 0 && atom.id === 'draw.cards'));
    const core = pickOne(coreCandidates);
    const compatible = atom => atom.types.includes(type) && (core.id !== 'deal.damage.all' || !atom.singleTarget);
    const specific = riders[pool].filter(compatible);
    const generic = riders.General.filter(compatible);
    const rider = pickOne(Math.random() < .84 && specific.length ? specific : generic);
    const coreText = core.render(cost);
    const riderText = rider.render();
    const effect = [coreText[0] + ' ' + riderText[0], coreText[1] + ' ' + riderText[1]];
    return { type, cost, upCost: cost, effect, signature: `${pool}:${type}:${core.id}:${rider.id}:${cost}:${coreText[1]}` };
  }
  return { generate, coreIds: Object.values(cores).flat().map(atom => atom.id),
    riderIds: Object.values(riders).flat().map(atom => atom.id) };
})();
