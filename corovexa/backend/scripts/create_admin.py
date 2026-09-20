import asyncio
import os
import sys
import getpass
from datetime import datetime, timezone

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.mongodb import MongoDBClient
from app.services.security import get_password_hash

async def main():
    print("=== COROVEXA Admin Creation ===")
    
    name = input("Enter Admin Name (e.g. System Admin): ").strip()
    email = input("Enter Admin Email: ").strip()
    password = getpass.getpass("Enter secure password: ")
    confirm_password = getpass.getpass("Confirm password: ")
    
    if password != confirm_password:
        print("Passwords do not match. Exiting.")
        return
        
    client = MongoDBClient.get_instance()
    await client.connect()
    
    if not client.is_connected:
        print("Failed to connect to MongoDB. Check MONGODB_URI in .env.")
        return
        
    users_collection = client.db.users
    
    # Check if user exists
    existing = await users_collection.find_one({"email": email})
    if existing:
        print(f"User with email {email} already exists!")
        await client.disconnect()
        return
        
    admin_user = {
        "name": name,
        "email": email,
        "password_hash": get_password_hash(password),
        "role": "Admin",
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    
    result = await users_collection.insert_one(admin_user)
    print(f"Admin user created successfully with ID: {result.inserted_id}")
    
    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
