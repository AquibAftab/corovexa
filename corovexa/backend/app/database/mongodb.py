import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from typing import Optional

logger = logging.getLogger(__name__)

class MongoDBClient:
    _instance: Optional["MongoDBClient"] = None

    def __init__(self) -> None:
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self._connected = False

    @classmethod
    def get_instance(cls) -> "MongoDBClient":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def connect(self) -> None:
        if not settings.MONGODB_URI:
            logger.warning("MONGODB_URI not set. Skipping DB connect.")
            return
        
        logger.info("Connecting to MongoDB Atlas...")
        self.client = AsyncIOMotorClient(settings.MONGODB_URI)
        self.db = self.client.get_database("CorovexaCluster") # Use a suitable default or dynamic db name
        self._connected = True
        logger.info("Connected to MongoDB successfully.")

    async def disconnect(self) -> None:
        if self.client:
            self.client.close()
            self._connected = False
            logger.info("Disconnected from MongoDB.")

    @property
    def is_connected(self) -> bool:
        return self._connected

db_client = MongoDBClient.get_instance()
