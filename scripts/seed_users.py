import requests
import json
import os
import time
import sys

# Inside Docker Compose, use the service name. Falls back to localhost for manual runs.
BASE_URL = os.getenv("SEED_BASE_URL", "http://localhost:3000/api")

users = [
    {
        "name": "Manu Factory",
        "email": "manufacturer@meditrace.com",
        "password": "manufacturer123",
        "role": "Manufacturer"
    },
    {
        "name": "System Admin",
        "email": "admin@meditrace.com",
        "password": "admin123",
        "role": "Admin"
    },
    {
        "name": "John Doe",
        "email": "consumer@meditrace.com",
        "password": "consumer123",
        "role": "Consumer"
    }
]


def wait_for_web_app(timeout: int = 120):
    """Poll the web app's health endpoint until it's ready or timeout expires."""
    health_url = f"{BASE_URL}/health"
    print(f"⏳ Waiting for web app to be ready at {health_url} ...")
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            r = requests.get(health_url, timeout=3)
            if r.status_code == 200:
                print("✅ Web app is ready!")
                return True
        except Exception:
            pass
        time.sleep(3)
    print(f"❌ Web app did not become ready within {timeout}s. Aborting seed.")
    return False


def seed_users():
    print(f"🌱 Seeding users against {BASE_URL} ...")
    all_ok = True
    for user in users:
        try:
            print(f"   Registering {user['name']} ({user['role']})...")
            response = requests.post(f"{BASE_URL}/register", json=user, timeout=10)
            if response.status_code == 201:
                print(f"   ✅ Created: {user['email']}")
            elif response.status_code == 400:
                print(f"   ⚠️  Already exists (skipped): {user['email']}")
            else:
                print(f"   ❌ Failed ({response.status_code}): {response.text}")
                all_ok = False
        except Exception as e:
            print(f"   ❌ Error registering {user['email']}: {e}")
            all_ok = False
    return all_ok


if __name__ == "__main__":
    if not wait_for_web_app():
        sys.exit(1)
    success = seed_users()
    if success:
        print("\n🎉 Seeding complete! All demo users are ready.")
    else:
        print("\n⚠️  Seeding finished with some errors.")
        sys.exit(1)
