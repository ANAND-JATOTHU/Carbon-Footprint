"""
database.py — Async SQLite setup using aiosqlite.
Database is ephemeral (/tmp) — seeded with demo data on every cold start.
"""
import aiosqlite
import uuid
import random
from passlib.context import CryptContext

DB_PATH = "/tmp/carbozero.db"

_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

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
async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id            TEXT PRIMARY KEY,
                email         TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name  TEXT NOT NULL,
                diet          TEXT,
                transport     TEXT,
                home          TEXT,
                total_co2     REAL DEFAULT 0,
                has_submitted INTEGER DEFAULT 0,
                created_at    TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        await db.execute("""
            CREATE TABLE IF NOT EXISTS user_actions (
                id         TEXT PRIMARY KEY,
                user_id    TEXT NOT NULL,
                action_id  INTEGER NOT NULL,
                co2_saved  REAL NOT NULL,
                logged_at  TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        await db.commit()
        await _seed_demo_data(db)


async def _seed_demo_data(db):
    """Pre-populate realistic demo users so leaderboard looks alive on cold start."""
    demo = [
        ("SolarHawk_4021",  "vegan",        "public_bike",   "apartment",   2.5),
        ("EcoLynx_99",      "vegetarian",   "ev",            "apartment",   3.4),
        ("GreenCrane_711",  "mixed",        "standard_car",  "apartment",   4.2),
        ("TerraEagle_X",    "mixed",        "standard_car",  "small_house", 5.5),
        ("LeafFox_303",     "high_meat",    "suv",           "small_house", 7.0),
        ("OceanRaven_88",   "vegetarian",   "public_bike",   "apartment",   2.7),
        ("WindDeer_512",    "vegan",        "ev",            "small_house", 3.0),
    ]
    for name, diet, transport, home, co2 in demo:
        uid = str(uuid.uuid4())
        ph = _pwd_ctx.hash("demo-password")
        await db.execute(
            """
            INSERT OR IGNORE INTO users
            (id, email, password_hash, display_name, diet, transport, home, total_co2, has_submitted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            """,
            (uid, f"{name.lower()}@demo.internal", ph, name, diet, transport, home, co2),
        )
    await db.commit()
