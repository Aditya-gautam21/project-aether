"""AI Service with Amazon Q integration and OpenAI fallback"""
import boto3
import openai
from typing import Optional, Dict, Any, List
from config import settings
import logging
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.amazon_q_client = None
        self.openai_client = None
        self._setup_clients()
    
    def _setup_clients(self):
        """Initialize AI service clients"""
        # Setup Amazon Q
        if settings.amazon_q_application_id and settings.aws_access_key_id:
            try:
                self.amazon_q_client = boto3.client(
                    'qbusiness',
                    aws_access_key_id=settings.aws_access_key_id,
                    aws_secret_access_key=settings.aws_secret_access_key,
                    region_name=settings.aws_region
                )
                logger.info("Amazon Q client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Amazon Q: {e}")
        
        # Setup OpenAI as fallback
        if settings.openai_api_key:
            try:
                openai.api_key = settings.openai_api_key
                self.openai_client = openai
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI: {e}")
    
    async def generate_response(
        self, 
        message: str, 
        context: Optional[List[Dict]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate AI response using Amazon Q or OpenAI fallback"""
        
        # Try Amazon Q first
        if self.amazon_q_client and settings.amazon_q_application_id:
            try:
                return await self._amazon_q_response(message, context, user_id)
            except Exception as e:
                logger.error(f"Amazon Q failed: {e}")
        
        # Fallback to OpenAI
        if self.openai_client:
            try:
                return await self._openai_response(message, context)
            except Exception as e:
                logger.error(f"OpenAI failed: {e}")
        
        # Final fallback to rule-based
        return await self._rule_based_response(message)
    
    async def _amazon_q_response(
        self, 
        message: str, 
        context: Optional[List[Dict]] = None,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate response using Amazon Q"""
        try:
            # Prepare conversation context
            conversation_context = []
            if context:
                for msg in context[-10:]:  # Last 10 messages for context
                    conversation_context.append({
                        'role': 'user' if msg.get('is_user') else 'assistant',
                        'content': msg.get('content', '')
                    })
            
            # Add current message
            conversation_context.append({
                'role': 'user',
                'content': message
            })
            
            # Call Amazon Q
            response = self.amazon_q_client.chat_sync(
                applicationId=settings.amazon_q_application_id,
                userMessage=message,
                conversationId=user_id or 'default',
                parentMessageId=None
            )
            
            return {
                'content': response.get('systemMessage', 'I apologize, but I couldn\'t process your request.'),
                'source': 'amazon_q',
                'confidence': 0.9,
                'metadata': {
                    'conversation_id': response.get('conversationId'),
                    'message_id': response.get('systemMessageId')
                }
            }
            
        except Exception as e:
            logger.error(f"Amazon Q API error: {e}")
            raise
    
    async def _openai_response(
        self, 
        message: str, 
        context: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Generate response using OpenAI"""
        try:
            # Prepare messages for OpenAI
            messages = [
                {
                    "role": "system",
                    "content": """You are Aether, an intelligent AI assistant specializing in productivity and automation. 
                    You help users with:
                    - Calendar management and meeting scheduling
                    - Task creation and management
                    - General questions and conversations
                    - Google Calendar integration
                    
                    Be helpful, concise, and professional. When users want to schedule meetings or create tasks, 
                    guide them through the process and ask for any missing information."""
                }
            ]
            
            # Add conversation context
            if context:
                for msg in context[-10:]:
                    messages.append({
                        "role": "user" if msg.get('is_user') else "assistant",
                        "content": msg.get('content', '')
                    })
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            # Call OpenAI
            response = await self.openai_client.ChatCompletion.acreate(
                model="gpt-4",
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            return {
                'content': response.choices[0].message.content,
                'source': 'openai',
                'confidence': 0.8,
                'metadata': {
                    'model': 'gpt-4',
                    'tokens_used': response.usage.total_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise
    
    async def _rule_based_response(self, message: str) -> Dict[str, Any]:
        """Fallback rule-based response"""
        message_lower = message.lower()
        
        # Import the existing agent logic
        try:
            from agents import handle_general_chat
            response_content = handle_general_chat(message)
        except ImportError:
            # Basic fallback responses
            if any(word in message_lower for word in ['hello', 'hi', 'hey']):
                response_content = "Hello! I'm Aether, your AI assistant. I can help you with calendar management, task creation, and general questions. How can I assist you today?"
            elif any(word in message_lower for word in ['help', 'what can you do']):
                response_content = """I can help you with:
• 📅 Schedule meetings and appointments
• ✅ Create and manage tasks
• 📋 View your calendar events
• 💬 Answer questions and have conversations

Try saying: "Book a meeting tomorrow at 2 PM" or "Create a task to review documents"
"""
            else:
                response_content = f"I understand you're asking about: '{message}'. I can help you with calendar management, task creation, and general questions. What would you like to do?"
        
        return {
            'content': response_content,
            'source': 'rule_based',
            'confidence': 0.6,
            'metadata': {}
        }
    
    def is_available(self) -> Dict[str, bool]:
        """Check which AI services are available"""
        return {
            'amazon_q': bool(self.amazon_q_client and settings.amazon_q_application_id),
            'openai': bool(self.openai_client and settings.openai_api_key),
            'rule_based': True
        }

# Global AI service instance
ai_service = AIService()