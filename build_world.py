"""Build an offline bilingual monster/relic/Ancient catalog from local game data."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT.parent / "spire-codex/data"
GAME = ROOT.parent / "export/111/localization"


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


monsters_en = {row["id"]: row for row in read(DATA / "monsters.json")}
monsters_zh = {row["id"]: row for row in read(DATA / "zhs/monsters.json")}
relics_en = {row["id"]: row for row in read(DATA / "relics.json")}
relics_zh = {row["id"]: row for row in read(DATA / "zhs/relics.json")}
game_monsters = read(GAME / "zhs/monsters.json")
game_relics = read(GAME / "zhs/relics.json")
game_ancients_zh = read(GAME / "zhs/ancients.json")
game_ancients_en = read(GAME / "eng/ancients.json")


def key(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


monsters = []
# The Codex snapshot predates the most recent beta notes. Apply published
# v0.111 values before using them as the fake v0.112 starting point.
recent_monster_values = {
    "AXEBOT": {"moves": {"HAMMER_UPPERCUT": (14, 18), "ONE_TWO": (10, 11)}},
    "EXOSKELETON": {"asc_hp": [26, 30]},
    "ENTOMANCER": {"asc_hp": [165, None]},
    "SOUL_FYSH": {"moves": {"DE_GAS": (16, 18)}},
}
for ident, en in monsters_en.items():
    zh = monsters_zh[ident]
    official = game_monsters.get(ident + ".name")
    title = official if official and "�" not in official else zh["name"]
    moves = []
    damage = en.get("damage_values") or {}
    zh_moves = {row["id"]: row["name"] for row in zh.get("moves") or []}
    for move in en.get("moves") or []:
        hit = next((stats for name, stats in damage.items() if key(name) == key(move["id"])), None)
        move_title = game_monsters.get(f"{ident}.moves.{move['id']}.title")
        if not move_title or "�" in move_title:
            move_title = zh_moves.get(move["id"], move["name"])
        current = recent_monster_values.get(ident, {}).get("moves", {}).get(move["id"])
        if current:
            hit = {**(hit or {}), "normal": current[0], "ascension": current[1]}
        moves.append({"id": move["id"], "en": move["name"], "zh": move_title, "damage": hit})
    monsters.append({"id": ident, "en": en["name"], "zh": title, "type": en["type"],
                     "hp": [en.get("min_hp"), en.get("max_hp")],
                     "ascHp": recent_monster_values.get(ident, {}).get("asc_hp", [en.get("min_hp_ascension"), en.get("max_hp_ascension")]),
                     "moves": moves})

relics = []
for ident, en in relics_en.items():
    zh = relics_zh[ident]
    official = game_relics.get(ident + ".title")
    title = official if official and "�" not in official else zh["name"]
    description_en, description_zh = en.get("description", ""), zh.get("description", "")
    raw_en, raw_zh = en.get("description_raw", ""), zh.get("description_raw", "")
    if ident == "REGALITE":
        description_en = "The first time you create a card each turn, gain [blue]4[/blue] [gold]Block[/gold]."
        description_zh = "每回合首次生成卡牌时，获得[blue]4[/blue]点[gold]格挡[/gold]。"
        raw_en = "The first time you create a card each turn, gain [blue]{Block}[/blue] [gold]Block[/gold]."
        raw_zh = "每回合首次生成卡牌时，获得[blue]{Block}[/blue]点[gold]格挡[/gold]。"
    if ident == "SIGNET_RING":
        title = "诺奴佩普的图章戒指"
        description_en = "Upon pickup, gain [blue]888[/blue] [gold]Gold[/gold]."
        description_zh = "拾起时，获得[blue]888[/blue]枚[gold]金币[/gold]。"
    relics.append({"id": ident, "en": en["name"], "zh": title,
                   "rarity": en["rarity"], "pool": en["pool"],
                   "descEn": description_en, "descZh": description_zh,
                   "rawEn": raw_en, "rawZh": raw_zh})

ancients = []
for ancient in read(DATA / "ancient_pools.json"):
    ident = ancient["id"]
    pools = []
    for pool in ancient["pools"]:
        pools.append({"name": pool["name"], "relics": [entry["id"] for entry in pool["relics"]]})
    ancients.append({"id": ident, "en": game_ancients_en.get(ident + ".title", ancient["name"]),
                     "zh": game_ancients_zh.get(ident + ".title", ancient["name"]), "pools": pools})

payload = {"monsters": monsters, "relics": relics, "ancients": ancients}
(ROOT / "world.json").write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {len(monsters)} monsters, {len(relics)} relics, {len(ancients)} Ancients")
