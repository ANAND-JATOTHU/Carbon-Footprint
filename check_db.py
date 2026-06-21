import asyncio
from google.cloud.firestore_v1.async_client import AsyncClient

async def check():
    db = AsyncClient(project="carbon-2cd28")
    doc = await db.collection("users").document("demo_seeded").get()
    print(f"Seeded: {doc.exists}")
    users = db.collection("users").stream()
    async for u in users:
        print(u.id, u.to_dict().get("display_name"))

if __name__ == "__main__":
    asyncio.run(check())
