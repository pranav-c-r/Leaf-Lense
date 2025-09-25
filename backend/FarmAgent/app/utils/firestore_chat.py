from .firestore_client import get_firestore_client
from firebase_admin import firestore

def save_chat_message(farmer_id, user_message, bot_response):
    """Saves chat conversation to Firebase"""
    db = get_firestore_client()
    
    chat_data = {
        'farmer_id': farmer_id,
        'user_message': user_message,
        'bot_response': bot_response,
        'timestamp': firestore.SERVER_TIMESTAMP
    }
    
    db.collection('chat_messages').add(chat_data)

def get_chat_history(farmer_id, limit=10):
    """Gets recent chat history for a farmer"""
    db = get_firestore_client()
    
    chats_ref = db.collection('chat_messages')
    chats_ref = chats_ref.where('farmer_id', '==', farmer_id)
    chats_ref = chats_ref.order_by('timestamp', direction='DESCENDING')
    chats_ref = chats_ref.limit(limit)
    
    messages = []
    for doc in chats_ref.stream():
        messages.append(doc.to_dict())
    
    return messages[::-1]  # Return in chronological order