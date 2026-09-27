"""Extract a small bilingual card catalog from chaosmod's native reference data."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "chaos/ChaosCardGenerator/Data/native_reference_cards.json"
DEST = ROOT / "cards.json"
POOLS = {"Ironclad", "Silent", "Defect", "Regent", "Necrobinder", "Colorless"}

source = json.loads(SOURCE.read_text(encoding="utf-8"))
cards = []
for card in source["Cards"]:
    base = card["Base"]
    upgrade = (card.get("Upgrade") or {}).get("Result") or {}
    variables = []
    for variable in base.get("Variables") or []:
        value = variable.get("BaseValue")
        if not isinstance(value, int) or isinstance(value, bool) or value < 1:
            continue
        token = "{" + variable["Id"] + ":"
        templates = card["DescriptionTemplate"]
        if not any(token in templates.get(lang, "") for lang in ("en", "zhHans")):
            continue
        next_value = (upgrade.get("Variables") or {}).get(variable["Id"], value)
        if not isinstance(next_value, int):
            next_value = value
        variables.append({"id": variable["Id"], "kind": variable["Kind"], "base": value, "up": next_value})
    cards.append({
        "pool": card["Pool"], "en": card["Title"]["en"], "zh": card["Title"]["zhHans"],
        "type": base["Type"], "rarity": base["Rarity"],
        "library": bool(card.get("ShouldShowInLibrary")),
        "regularPool": card["Pool"] in POOLS,
        "cost": base["EnergyCost"], "upCost": upgrade.get("EnergyCost", base["EnergyCost"]),
        "keywords": base.get("Keywords") or [],
        "upKeywords": upgrade.get("Keywords", base.get("Keywords") or []),
        "descEn": card["DescriptionTemplate"]["en"], "descZh": card["DescriptionTemplate"]["zhHans"],
        "vars": variables,
    })
DEST.write_text(json.dumps(cards, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"Wrote {len(cards)} native reference cards to {DEST}")
