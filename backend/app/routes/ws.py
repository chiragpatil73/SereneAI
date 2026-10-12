from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import User
from ..services import pipeline
from ..utils.security import decode_token

router = APIRouter(tags=["ws"])

STATUS_LISTENING = {"type": "status", "stage": "listening", "message": "Listening..."}
STATUS_UNDERSTANDING = {"type": "status", "stage": "understanding", "message": "Understanding..."}
STATUS_PREPARING = {"type": "status", "stage": "preparing", "message": "Preparing your next step..."}


@router.websocket("/ws/chat")
async def chat_socket(websocket: WebSocket) -> None:
    token = websocket.query_params.get("token")
    user_id = decode_token(token) if token else None
    if user_id is None:
        await websocket.close(code=4401, reason="Unauthorized")
        return

    await websocket.accept()
    db: Session = SessionLocal()
    try:
        user = db.get(User, user_id)
        if user is None:
            await websocket.close(code=4401, reason="Unauthorized")
            return

        session_id = None
        raw = websocket.query_params.get("session_id")
        if raw and raw.isdigit():
            session_id = int(raw)

        while True:
            raw_frame = await websocket.receive_text()
            try:
                data = json.loads(raw_frame)
            except json.JSONDecodeError:
                await websocket.send_json({"type": "error", "message": "That message could not be read. Please try again."})
                continue

            text = (data.get("message") or "").strip()
            user_reported_stress = data.get("user_reported_stress")

            await websocket.send_json(STATUS_LISTENING)
            await asyncio.sleep(0.05)

            try:
                session = pipeline.get_or_create_session(db, user, session_id or data.get("session_id"))
            except LookupError:
                await websocket.send_json({"type": "error", "message": "Session not found."})
                continue
            session_id = session.id

            await websocket.send_json(STATUS_UNDERSTANDING)
            try:
                result = await asyncio.to_thread(
                    pipeline.process_message, db, user=user, session=session, text=text,
                    user_reported_stress=user_reported_stress,
                )
            except pipeline.InvalidInput as exc:
                await websocket.send_json({"type": "error", "message": str(exc)})
                continue

            if result["type"] == "response":
                await websocket.send_json(STATUS_PREPARING)
                await asyncio.sleep(0.05)
            await websocket.send_json({**result, "type": f"result:{result['type']}"})
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
