"""
database.py — Async Google Cloud Firestore setup.
"""
from google.cloud.firestore_v1.async_client import AsyncClient
import uuid
import random
from datetime import datetime, timezone

# ── CO₂ emission factors (IPCC-derived, metric tons / year) ──
DIET_FACTORS = {
    "vegan": 1.5,
    "vegetarian": 1.7,
    "mixed": 2.5,
    "high_meat": 3.3,
}
TRANSPORT_FACTORS = {
    "public_bike": 0.5,
    "ev": 1.2,
    "standard_car": 2.4,
    "suv": 3.2,
}
HOME_FACTORS = {
    "apartment": 1.5,
    "small_house": 2.8,
    "large_house": 4.2,
}


def calculate_co2(diet: str, transport: str, home: str) -> float:
    return round(
        DIET_FACTORS.get(diet, 2.5)
        + TRANSPORT_FACTORS.get(transport, 2.4)
        + HOME_FACTORS.get(home, 2.8),
        2,
    )


# ── Display name generator ────────────────────────────────────
_ECO_WORDS = [
    "Solar", "Eco", "Green", "Leaf", "Terra", "Bio",
    "Forest", "Ocean", "Wind", "Ember", "Coral", "Arctic",
]
_ANIMALS = [
    "Panda", "Hawk", "Fox", "Wolf", "Eagle", "Lynx",
    "Crane", "Orca", "Raven", "Heron", "Deer", "Seal",
]


def generate_display_name() -> str:
    return (
        f"{random.choice(_ECO_WORDS)}"
        f"{random.choice(_ANIMALS)}"
        f"_{random.randint(100, 9999)}"
    )

# ── DB helpers ────────────────────────────────────────────────
# Use a global client instance
db_client = AsyncClient(project="carbon-2cd28")

async def get_db():
    yield db_client

async def init_db():
    # Pre-populate realistic demo users so leaderboard looks alive on cold start.
    demo_ref = db_client.collection("users").document("demo_seeded")
    doc = await demo_ref.get()
    if not doc.exists:
        demo = [
            ("SolarHawk_4021",  "vegan",        "public_bike",   "apartment",   2.5),
            ("EcoLynx_99",      "vegetarian",   "ev",            "apartment",   3.4),
            ("GreenCrane_711",  "mixed",        "standard_car",  "apartment",   4.2),
            ("TerraEagle_X",    "mixed",        "standard_car",  "small_house", 5.5),
            ("LeafFox_303",     "high_meat",    "suv",           "small_house", 7.0),
            ("OceanRaven_88",   "vegetarian",   "public_bike",   "apartment",   2.7),
            ("WindDeer_512",    "vegan",        "ev",            "small_house", 3.0),
        ]
        batch = db_client.batch()
        for name, diet, transport, home, co2 in demo:
            uid = str(uuid.uuid4())
            ref = db_client.collection("users").document(uid)
            batch.set(ref, {
                "id": uid,
                "email": f"{name.lower()}@demo.internal",
                "display_name": name,
                "diet": diet,
                "transport": transport,
                "home": home,
                "total_co2": co2,
                "has_submitted": 1,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        batch.set(demo_ref, {"seeded": True})
        await batch.commit()
