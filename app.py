from flask import Flask, request, jsonify, send_from_directory
from openai import OpenAI
import os
from datetime import datetime
import uuid

app = Flask(__name__, static_folder='static')
app.secret_key = os.urandom(24)  # For session management

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        message = data.get('message')
        chat_history = data.get('chat_history', [])
        
        if not api_key:
            return jsonify({'error': 'API key is required'}), 400
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Initialize OpenAI client with OpenRouter
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        
        # Prepare messages for the API with health context
        system_message = {
            "role": "system",
            "content": """You are a helpful AI doctor and medical information provider. You can help users understand symptoms, provide general health information, and suggest when to seek professional medical care.

IMPORTANT DISCLAIMERS:
- You are not a replacement for professional medical advice, diagnosis, or treatment
- Always recommend consulting with qualified healthcare professionals for serious concerns
- In emergencies, advise users to call emergency services immediately
- Provide educational information while emphasizing the importance of professional medical consultation

Be empathetic, informative, and always prioritize user safety by recommending professional medical care when appropriate."""
        }
        
        messages = [system_message]
        for msg in chat_history:
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add the new user message
        messages.append({
            "role": "user",
            "content": message
        })
        
        # Make the API call to the AI doctor service
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",  # Your site URL
                "X-Title": "AI Doctor Assistant",  # Your site name
            },
            extra_body={},
            model="deepseek/deepseek-r1-0528:free",
            messages=messages
        )
        
        response_content = completion.choices[0].message.content
        
        return jsonify({
            'response': response_content,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': f'Failed to get response: {str(e)}'}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
