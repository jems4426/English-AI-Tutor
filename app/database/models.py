from sqlalchemy import Column, Integer, Text, DateTime, String
from datetime import datetime

from app.database.database import Base


class ChatHistory(Base):

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(String, index=True)

    user_message = Column(Text)

    ai_reply = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)