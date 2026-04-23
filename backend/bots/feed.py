"""Feed calculator bot.

Formula (standard aquaculture practice):
    daily_feed_kg = (num_fish * fish_weight_g / 1000) * feeding_rate_percent / 100

Feeding rate (% body weight/day) depends on life-stage and species.
"""
from __future__ import annotations

from typing import Any

# (min_g_inclusive, max_g_exclusive, rate_percent, stage_label)
FEEDING_STAGES = [
    (0, 5, 10.0, "fry"),
    (5, 50, 6.0, "fingerling"),
    (50, 250, 4.0, "juvenile"),
    (250, 600, 2.5, "grower"),
    (600, 10_000, 1.8, "adult"),
]

SPECIES_MULTIPLIER = {
    "rohu": 1.0,
    "catla": 1.05,
    "mrigal": 1.0,
    "tilapia": 1.1,
    "pangasius": 1.15,
    "common_carp": 1.0,
    "grass_carp": 0.95,
    "generic": 1.0,
}


def _rate_for_weight(weight_g: float) -> tuple[float, str]:
    for low, high, rate, stage in FEEDING_STAGES:
        if low <= weight_g < high:
            return rate, stage
    return 1.5, "adult"


def calculate_feed(
    fish_weight_g: float,
    num_fish: int,
    species: str = "generic",
    meals_per_day: int = 2,
) -> dict[str, Any]:
    if fish_weight_g <= 0 or num_fish <= 0:
        return {
            "ok": False,
            "error": "invalid_input",
            "message": "Please provide positive fish weight (grams) and number of fish.",
        }

    rate, stage = _rate_for_weight(float(fish_weight_g))
    multiplier = SPECIES_MULTIPLIER.get(species.lower().strip(), 1.0)
    effective_rate = rate * multiplier

    total_biomass_kg = (num_fish * fish_weight_g) / 1000.0
    daily_feed_kg = total_biomass_kg * effective_rate / 100.0
    per_meal_kg = daily_feed_kg / max(1, meals_per_day)

    monthly_feed_kg = daily_feed_kg * 30.0

    return {
        "ok": True,
        "inputs": {
            "fish_weight_g": fish_weight_g,
            "num_fish": num_fish,
            "species": species,
            "meals_per_day": meals_per_day,
        },
        "stage": stage,
        "feeding_rate_percent": round(effective_rate, 2),
        "biomass_kg": round(total_biomass_kg, 2),
        "daily_feed_kg": round(daily_feed_kg, 3),
        "per_meal_kg": round(per_meal_kg, 3),
        "monthly_feed_kg": round(monthly_feed_kg, 2),
        "tip": (
            f"Feed {round(daily_feed_kg, 2)} kg/day split into "
            f"{meals_per_day} meals. Reduce 30–50% on heavy-rain or cold days."
        ),
    }
