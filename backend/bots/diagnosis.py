"""
Rule-based fish disease & behaviour diagnosis bot.
Matches symptoms to the most likely issue with remedies.
"""
from __future__ import annotations

from typing import Any

from .translate import t

# Ordered by specificity — more specific first.
RULES = [
    {
        "id": "low_oxygen",
        "keywords": [
            "gasping", "surface", "mouth open", "top of pond", "morning surface",
            "सतह पर", "ऑक्सीजन", "पृष्ठभाग", "तोंड उघडे", "पृष्ठभागावर",
        ],
        "title": "Low Dissolved Oxygen",
        "severity": "high",
        "cause": "Overstocking, algae die-off, or cloudy weather reducing oxygen.",
        "remedy": [
            "Start aerator / paddle-wheel immediately.",
            "Stop feeding for 24 hours.",
            "Partial water exchange 20–30%.",
            "Check pH (6.5–8.5) and ammonia.",
        ],
    },
    {
        "id": "ich",
        "keywords": [
            "white spot", "small white", "white dot", "ick", "ich",
            "सफेद धब्बे", "पांढरे ठिपके", "पांढरे डाग",
        ],
        "title": "White Spot Disease (Ich)",
        "severity": "medium",
        "cause": "Ichthyophthirius multifiliis parasite — common in cold/stressed fish.",
        "remedy": [
            "Raise pond/tank temp gradually to 28–30 °C if possible.",
            "Salt bath: 1–3 g/L for 5–7 days.",
            "Improve water quality and reduce density.",
        ],
    },
    {
        "id": "aeromonas",
        "keywords": [
            "red spot", "red patch", "ulcer", "hemorrhage", "bloody",
            "लाल धब्बे", "फोड़ा", "लाल डाग", "लाल ठिपके", "फोड",
        ],
        "title": "Bacterial Ulcer (Aeromonas / EUS)",
        "severity": "high",
        "cause": "Aeromonas hydrophila / fungal secondary infection via wounds.",
        "remedy": [
            "Quarantine affected fish.",
            "Lime the pond: 200–250 kg/ha.",
            "Medicated feed with oxytetracycline 50 mg/kg for 7 days (consult vet).",
            "Improve water quality; reduce organic load.",
        ],
    },
    {
        "id": "fin_rot",
        "keywords": [
            "fin rot", "frayed fin", "tail rot", "fin damage", "torn fin",
            "पंख सड़", "पंख गले", "पंख कुजले", "पंख कुज",
        ],
        "title": "Fin Rot",
        "severity": "medium",
        "cause": "Poor water quality, bacterial infection in stressed fish.",
        "remedy": [
            "Water exchange + test ammonia/nitrite.",
            "Salt bath 3 g/L for 3 days.",
            "Remove sharp objects; reduce fighting/overcrowding.",
        ],
    },
    {
        "id": "not_eating",
        "keywords": [
            "not eating", "no appetite", "lethargic", "inactive", "weak",
            "नहीं खा", "सुस्त", "खात नाही", "थकलेले", "थकले",
        ],
        "title": "Loss of Appetite / Stress",
        "severity": "low",
        "cause": "Water-quality stress, sudden temp shift, or disease onset.",
        "remedy": [
            "Stop feeding for 24–48 hours.",
            "Test ammonia, nitrite, pH, and DO.",
            "Do partial water change if ammonia > 0.5 ppm.",
            "Observe for secondary symptoms (spots/ulcers).",
        ],
    },
    {
        "id": "gill_damage",
        "keywords": [
            "swollen gill", "red gill", "pale gill", "gill",
            "गिल्ल", "कल्ले",
        ],
        "title": "Gill Irritation / Flukes",
        "severity": "medium",
        "cause": "Gill flukes, poor water, or chlorine exposure.",
        "remedy": [
            "Formalin 25 ppm bath (30 min) — handle carefully.",
            "Ensure dechlorinated water.",
            "Improve aeration.",
        ],
    },
    {
        "id": "fungus",
        "keywords": [
            "cotton", "white fuzz", "fungus", "fluffy",
            "फफूंद", "बुरशी",
        ],
        "title": "Fungal Infection (Saprolegnia)",
        "severity": "medium",
        "cause": "Secondary fungal growth on wounds or eggs.",
        "remedy": [
            "Salt bath 3–5 g/L for 5 minutes.",
            "Potassium permanganate 2 ppm dip.",
            "Keep water clean and well-aerated.",
        ],
    },
    {
        "id": "dropsy",
        "keywords": [
            "bloated", "swollen belly", "pinecone scales", "dropsy",
            "सूजा", "फुगीर",
        ],
        "title": "Dropsy",
        "severity": "high",
        "cause": "Internal bacterial infection; often poor prognosis.",
        "remedy": [
            "Isolate fish immediately.",
            "Medicated feed (antibiotic) under vet guidance.",
            "Improve water quality and reduce stress.",
        ],
    },
]


def diagnose(text: str, language: str = "en") -> dict[str, Any]:
    if not text:
        return {
            "ok": False,
            "message": t("diagnosis_unknown", language),
            "matches": [],
        }
    lowered = text.lower()
    matches = []
    for rule in RULES:
        hits = sum(1 for kw in rule["keywords"] if kw.lower() in lowered)
        if hits > 0:
            matches.append({**rule, "score": hits})

    matches.sort(key=lambda r: (-r["score"], r["severity"] != "high"))
    top = matches[:3]

    if not top:
        return {
            "ok": True,
            "intro": t("diagnosis_unknown", language),
            "matches": [],
        }

    return {
        "ok": True,
        "intro": t("diagnosis_intro", language),
        "matches": top,
    }
