"""WebSocket manager for real-time chat functionality"""
import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_sessions: Dict[str, str] = {}  # user_id -> session_id
    
    async def connect(self, websocket: WebSocket, user_id: str, session_id: str):
        """Accept WebSocket connection and store it"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        self.user_sessions[user_id] = session_id
        logger.info(f"User {user_id} connected to session {session_id}")
        
        # Send welcome message
        await self.send_message(session_id, {
            "type": "system",
            "content": "Connected to Aether AI Assistant",
            "timestamp": datetime.now().isoformat()
        })
    
    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        
        # Remove from user sessions
        for user_id, sess_id in list(self.user_sessions.items()):
            if sess_id == session_id:
                del self.user_sessions[user_id]
                break
        
        logger.info(f"Session {session_id} disconnected")
    
    async def send_message(self, session_id: str, message: dict):
        """Send message to specific session"""
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to {session_id}: {e}")
                self.disconnect(session_id)
    
    async def send_typing_indicator(self, session_id: str, is_typing: bool = True):
        """Send typing indicator"""
        await self.send_message(session_id, {
            "type": "typing",
            "is_typing": is_typing,
            "timestamp": datetime.now().isoformat()
        })
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Send message to all sessions of a user"""
        if user_id in self.user_sessions:
            session_id = self.user_sessions[user_id]
            await self.send_message(session_id, message)
    
    def get_active_sessions(self) -> List[str]:
        """Get list of active session IDs"""
        return list(self.active_connections.keys())
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if user is online"""
        return user_id in self.user_sessions

# Global connection manager
manager = ConnectionManager()

class ChatWebSocketHandler:
    def __init__(self, connection_manager: ConnectionManager):
        self.manager = connection_manager
    
    async def handle_message(self, websocket: WebSocket, session_id: str, user_id: str):
        """Handle incoming WebSocket messages"""
        try:
            while True:
                # Receive message
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Process different message types
                message_type = message_data.get("type", "chat")
                
                if message_type == "chat":
                    await self._handle_chat_message(session_id, user_id, message_data)
                elif message_type == "typing":
                    await self._handle_typing(session_id, message_data)
                elif message_type == "ping":
                    await self._handle_ping(session_id)
                else:
                    logger.warning(f"Unknown message type: {message_type}")
        
        except WebSocketDisconnect:
            self.manager.disconnect(session_id)
        except Exception as e:
            logger.error(f"WebSocket error for session {session_id}: {e}")
            self.manager.disconnect(session_id)
    
    async def _handle_chat_message(self, session_id: str, user_id: str, message_data: dict):
        """Handle chat messages"""
        try:
            content = message_data.get("content", "")
            if not content.strip():
                return
            
            # Send typing indicator
            await self.manager.send_typing_indicator(session_id, True)
            
            # Import AI service
            from ai_service import ai_service
            from enhanced_tools import calendar_tools, task_tools
            
            # Get conversation context (simplified for now)
            context = message_data.get("context", [])
            
            # Check if this is a tool-related request
            content_lower = content.lower()
            
            if any(keyword in content_lower for keyword in ['book', 'schedule', 'meeting', 'appointment']):
                # Handle calendar booking
                result = calendar_tools.book_meeting(content, user_id)
                response_content = result['message']
                
                # Send additional data if successful
                if result['success'] and 'event' in result:
                    await self.manager.send_message(session_id, {
                        "type": "event_created",
                        "event": result['event'],
                        "timestamp": datetime.now().isoformat()
                    })
            
            elif any(keyword in content_lower for keyword in ['create', 'add']) and 'task' in content_lower:
                # Handle task creation
                result = task_tools.create_task(content, user_id)
                response_content = result['message']
                
                # Send additional data if successful
                if result['success'] and 'task' in result:
                    await self.manager.send_message(session_id, {
                        "type": "task_created",
                        "task": result['task'],
                        "timestamp": datetime.now().isoformat()
                    })
            
            elif any(keyword in content_lower for keyword in ['show', 'list', 'get']) and ('event' in content_lower or 'calendar' in content_lower):
                # Handle event listing
                result = calendar_tools.get_events(content, user_id)
                response_content = result['message']
                
                if result['success'] and 'events' in result:
                    await self.manager.send_message(session_id, {
                        "type": "events_list",
                        "events": result['events'],
                        "timestamp": datetime.now().isoformat()
                    })
            
            elif any(keyword in content_lower for keyword in ['show', 'list', 'get']) and 'task' in content_lower:
                # Handle task listing
                result = task_tools.get_tasks(content, user_id)
                response_content = result['message']
                
                if result['success'] and 'tasks' in result:
                    await self.manager.send_message(session_id, {
                        "type": "tasks_list",
                        "tasks": result['tasks'],
                        "timestamp": datetime.now().isoformat()
                    })
            
            else:
                # Handle general AI conversation
                ai_response = await ai_service.generate_response(content, context, user_id)
                response_content = ai_response['content']
                
                # Send AI metadata
                await self.manager.send_message(session_id, {
                    "type": "ai_metadata",
                    "source": ai_response['source'],
                    "confidence": ai_response['confidence'],
                    "timestamp": datetime.now().isoformat()
                })
            
            # Stop typing indicator
            await self.manager.send_typing_indicator(session_id, False)
            
            # Send AI response
            await self.manager.send_message(session_id, {
                "type": "message",
                "content": response_content,
                "is_user": False,
                "timestamp": datetime.now().isoformat(),
                "id": f"msg_{int(datetime.now().timestamp() * 1000)}"
            })
            
        except Exception as e:
            logger.error(f"Error handling chat message: {e}")
            await self.manager.send_typing_indicator(session_id, False)
            await self.manager.send_message(session_id, {
                "type": "error",
                "content": "I encountered an error processing your message. Please try again.",
                "timestamp": datetime.now().isoformat()
            })
    
    async def _handle_typing(self, session_id: str, message_data: dict):
        """Handle typing indicators"""
        # For now, just acknowledge - could be used for multi-user chats
        pass
    
    async def _handle_ping(self, session_id: str):
        """Handle ping messages for connection keepalive"""
        await self.manager.send_message(session_id, {
            "type": "pong",
            "timestamp": datetime.now().isoformat()
        })

# Global WebSocket handler
websocket_handler = ChatWebSocketHandler(manager)