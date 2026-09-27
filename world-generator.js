/* Offline changes drawn from the complete localized monster/relic catalogs. */
const worldGenerator = (() => {
  const pickOne = values => values[Math.floor(Math.random() * values.length)];
  const range = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const clean = value => value.replace(/\[\/?(?:blue|gold|red|green|i|b)\]/g, '');
  const span = values => values[1] && values[1] !== values[0] ? `${values[0]}-${values[1]}` : String(values[0]);
  const pair = (base, asc) => asc && asc[0] ? `${span(base)}(${span(asc)})` : span(base);

  function enemyCandidates(world, type) {
    return world.monsters.filter(monster => monster.type === type && Number.isInteger(monster.hp[0]) &&
      monster.hp[0] > 0 && monster.hp[0] < 2000 && !/[{}�]/.test(monster.en + monster.zh));
  }
  function enemy(world, type) {
    const monster = pickOne(enemyCandidates(world, type));
    const usableMoves = monster.moves.filter(move => move.damage && Number.isInteger(move.damage.normal) &&
      move.damage.normal > 0 && move.damage.normal < 100);
    const useMove = usableMoves.length > 0 && Math.random() < .52;
    const direction = Math.random() < .68 ? 1 : -1;
    const onlyAsc = Math.random() < .34;
    const step = type === 'Boss' ? range(5, 10) : type === 'Elite' ? range(3, 6) : range(1, 3);
    if (useMove) {
      const move = pickOne(usableMoves);
      const oldBase = move.damage.normal;
      const oldAsc = move.damage.ascension || oldBase;
      const delta = direction * (oldBase >= 15 ? 2 : 1);
      const newBase = onlyAsc && oldAsc !== oldBase ? oldBase : Math.max(1, oldBase + delta);
      const newAsc = Math.max(1, oldAsc + delta);
      const hits = move.damage.hit_count > 1 ? `×${move.damage.hit_count}` : '';
      return { id: monster.id, type, kind: 'damage', name: [monster.zh, monster.en],
        move: [move.zh, move.en], old: `${pair([oldBase], [oldAsc])}${hits}`,
        next: `${pair([newBase], [newAsc])}${hits}`,
        ascension: onlyAsc && oldAsc !== oldBase ? 9 : null, buff: direction > 0 };
    }
    const old = monster.hp;
    const asc = monster.ascHp[0] ? monster.ascHp : null;
    const apply = values => values ? values.map(value => value === null ? null : Math.max(1, value + direction * step)) : null;
    const newBase = onlyAsc && asc ? old : apply(old);
    const newAsc = apply(asc);
    return { id: monster.id, type, kind: 'hp', name: [monster.zh, monster.en],
      old: pair(old, asc), next: pair(newBase, newAsc),
      ascension: onlyAsc && asc ? 8 : null, buff: direction > 0 };
  }
  function enemies(world) {
    const types = ['Normal', 'Elite', 'Boss'].sort(() => Math.random() - .5).slice(0, range(2, 3));
    const result = [];
    for (const type of types) {
      let change = enemy(world, type);
      for (let tries = 0; tries < 8 && result.some(item => item.id === change.id); tries++) change = enemy(world, type);
      result.push(change);
    }
    return result;
  }

  function relicValue(relic) {
    const vars = [...relic.rawEn.matchAll(/\{([A-Za-z][A-Za-z0-9]*)\}/g)];
    const enNumbers = [...relic.descEn.matchAll(/\[blue\](\d+)\[\/blue\]/g)];
    const zhNumbers = [...relic.descZh.matchAll(/\[blue\](\d+)\[\/blue\]/g)];
    if (vars.length !== 1 || enNumbers.length !== 1 || zhNumbers.length !== 1 ||
        enNumbers[0][1] !== zhNumbers[0][1]) return null;
    const n = Number(enNumbers[0][1]);
    if (n < 1 || n > 999 || /[\[\]{}]/.test(clean(relic.descEn)) || /[\[\]{}]/.test(clean(relic.descZh))) return null;
    return { amount: n, variable: vars[0][1] };
  }
  function relicCandidates(world, rarity) {
    return world.relics.filter(relic => relic.rarity === rarity && relicValue(relic) &&
      relic.descEn.length < 210 && !/[{}�]/.test(relic.en + relic.zh));
  }
  function relic(world, rarity) {
    const source = pickOne(relicCandidates(world, rarity));
    const { amount, variable } = relicValue(source);
    const direction = amount === 1 ? 1 : Math.random() < .7 ? 1 : -1;
    const step = amount >= 50 ? 5 : amount >= 12 ? 2 : 1;
    const nextValue = amount + direction * step;
    const old = [clean(source.descZh), clean(source.descEn)];
    const next = [clean(source.descZh.replace(`[blue]${amount}[/blue]`, `[blue]${nextValue}[/blue]`)),
      clean(source.descEn.replace(`[blue]${amount}[/blue]`, `[blue]${nextValue}[/blue]`))];
    return { kind: 'relic', id: source.id, rarity, name: [source.zh, source.en], old, next, variable };
  }
  function relics(world) {
    const rarities = ['Common', 'Uncommon', 'Rare', 'Shop', 'Event', 'Starter'];
    const count = range(1, 2);
    return rarities.sort(() => Math.random() - .5).slice(0, count).map(rarity => relic(world, rarity));
  }
  function ancientMove(world) {
    const owners = world.ancients.filter(ancient => ancient.pools.filter(pool => /^Pool [123]$/.test(pool.name)).length >= 2);
    const owner = pickOne(owners);
    const pools = owner.pools.filter(pool => /^Pool [123]$/.test(pool.name));
    const from = pickOne(pools);
    const to = pickOne(pools.filter(pool => pool !== from));
    const options = from.relics.filter(id => id !== 'SAND_CASTLE' && world.relics.some(relic => relic.id === id));
    const chosenId = pickOne(options);
    const relic = world.relics.find(item => item.id === chosenId);
    return { kind: 'move', owner: [owner.zh, owner.en], relic: [relic.zh, relic.en],
      from: Number(from.name.slice(-1)), to: Number(to.name.slice(-1)), id: relic.id };
  }
  return { enemies, enemyCandidates, relics, relicCandidates, relic, ancientMove };
})();
