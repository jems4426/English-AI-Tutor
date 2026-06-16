from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid

from app.ai.tutor import get_ai_response

from app.database.database import engine, SessionLocal
from app.database.models import ChatHistory
from app.database.database import Base


# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load system prompt
with open("app/prompts/system_prompt.txt", "r", encoding="utf-8") as f:
    SYSTEM_PROMPT = f.read()


# Request model
class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


# Home route
@app.get("/")
def home():
    return {
        "message": "Zentro Backend Running"
    }


# Chat route
@app.post("/chat")
def chat(request: ChatRequest):

    db = SessionLocal()

    # Generate session ID if new session
    session_id = request.session_id

    if not session_id:
        session_id = str(uuid.uuid4())

    # Get previous chats
    previous_chats = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.id.desc()).limit(2).all()

    previous_chats.reverse()

    # Build conversation history
    conversation_history = []

    # Add system prompt
    conversation_history.append({
        "role": "system",
        "content": SYSTEM_PROMPT
    })

    # Add previous chats
    for chat_item in previous_chats:

        conversation_history.append({
            "role": "user",
            "content": chat_item.user_message
        })

        conversation_history.append({
            "role": "assistant",
            "content": chat_item.ai_reply
        })

    # Add current user message with instructions
    conversation_history.append({
        "role": "user",
        "content": f"""
User sentence:
{request.message}

Instructions:

- If the sentence has grammar mistakes:
  first correct it, then reply naturally.

- If the sentence is already correct:
  do not correct it, only reply naturally.

- Keep replies short and friendly.

Response format:

If correction is needed:

Correct sentence:
"..."

Reply:
"..."

If correction is NOT needed:

Reply:
"..."
"""
    })

    # Get AI response
    ai_reply = get_ai_response(conversation_history)

    # Save chat to database
    chat_data = ChatHistory(
        session_id=session_id,
        user_message=request.message,
        ai_reply=ai_reply
    )

    db.add(chat_data)
    db.commit()
    db.close()

    return {
        "session_id": session_id,
        "user_message": request.message,
        "ai_reply": ai_reply
    }