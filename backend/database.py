"""
database.py — Async Google Cloud Firestore setup and data models.

Provides:
    - CO₂ emission factor constants (IPCC-derived)
    - CO₂ calculation engine
    - Anonymous display name generator
    - Firestore client initialization and dependency injection
    - Demo data seeding for cold-start leaderboard
"""
import uuid
import random
import logging
from datetime import datetime, timezone
from typing import AsyncGenerator

from google.cloud.firestore_v1.async_client import AsyncClient

logger = logging.getLogger(__name__)

# ── CO₂ Emission Factors (IPCC-derived, metric tons CO₂e / year) ──
DIET_FACTORS: dict[str, float] = {
    "vegan": 1.5,
    "vegetarian": 1.7,
    "mixed": 2.5,
    "high_meat": 3.3,
}

TRANSPORT_FACTORS: dict[str, float] = {
    "public_bike": 0.5,
    "ev": 1.2,
    "standard_car": 2.4,
    "suv": 3.2,
}

HOME_FACTORS: dict[str, float] = {
    "apartment": 1.5,
    "small_house": 2.8,
    "large_house": 4.2,
}

# Default fallback values (median lifestyle)
DEFAULT_DIET_FACTOR: float = 2.5
DEFAULT_TRANSPORT_FACTOR: float = 2.4
DEFAULT_HOME_FACTOR: float = 2.8


def calculate_co2(diet: str, transport: str, home: str) -> float:
    """
    Calculate annual CO₂ emissions based on lifestyle choices.

    Args:
        diet: One of 'vegan', 'vegetarian', 'mixed', 'high_meat'.
        transport: One of 'public_bike', 'ev', 'standard_car', 'suv'.
        home: One of 'apartment', 'small_house', 'large_house'.

    Returns:
        Total annual CO₂ in metric tons, rounded to 2 decimal places.
    """
    diet_co2 = DIET_FACTORS.get(diet, DEFAULT_DIET_FACTOR)
    transport_co2 = TRANSPORT_FACTORS.get(transport, DEFAULT_TRANSPORT_FACTOR)
    home_co2 = HOME_FACTORS.get(home, DEFAULT_HOME_FACTOR)
    return round(diet_co2 + transport_co2 + home_co2, 2)


# ── Display Name Generator ───────────────────────────────────
_ECO_WORDS: list[str] = [
    "Solar", "Eco", "Green", "Leaf", "Terra", "Bio",
    "Forest", "Ocean", "Wind", "Ember", "Coral", "Arctic",
]
_ANIMALS: list[str] = [
    "Panda", "Hawk", "Fox", "Wolf", "Eagle", "Lynx",
    "Crane", "Orca", "Raven", "Heron", "Deer", "Seal",
]


def generate_display_name() -> str:
    """Generate a privacy-preserving display name (e.g., 'SolarPanda_4021')."""
    return f"{random.choice(_ECO_WORDS)}{random.choice(_ANIMALS)}_{random.randint(100, 9999)}"


# ── Firestore Client ─────────────────────────────────────────
db_client: AsyncClient = AsyncClient(project="carbon-2cd28")


async def get_db() -> AsyncGenerator[AsyncClient, None]:
    """FastAPI dependency that yields the Firestore async client."""
    yield db_client


async def init_db() -> None:
    """
    Initialize the database with demo seed data on first run.

    Creates 7 realistic demo users so the leaderboard and community
    features look active immediately after deployment.
    """
    demo_ref = db_client.collection("users").document("demo_seeded")
    doc = await demo_ref.get()

    if not doc.exists:
        logger.info("Seeding demo users for leaderboard...")
        demo_users = [
            ("SolarHawk_4021",  "vegan",        "public_bike",   "apartment",   2.5),
            ("EcoLynx_99",      "vegetarian",   "ev",            "apartment",   3.4),
            ("GreenCrane_711",  "mixed",        "standard_car",  "apartment",   4.2),
            ("TerraEagle_X",    "mixed",        "standard_car",  "small_house", 5.5),
            ("LeafFox_303",     "high_meat",    "suv",           "small_house", 7.0),
            ("OceanRaven_88",   "vegetarian",   "public_bike",   "apartment",   2.7),
            ("WindDeer_512",    "vegan",        "ev",            "small_house", 3.0),
        ]
        batch = db_client.batch()
        for name, diet, transport, home, co2 in demo_users:
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
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        batch.set(demo_ref, {"seeded": True})
        await batch.commit()
        logger.info("Demo users seeded successfully.")
    else:
        logger.info("Demo users already exist, skipping seed.")
