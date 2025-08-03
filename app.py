from flask import Flask, render_template, request, jsonify, session
from openai import OpenAI
import os
from datetime import datetime
import uuid

app = Flask(__name__)
app.secret_key = os.urandom(24)  # For session management

@app.route('/')
def index():
    return render_template('index.html')

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
        
        # Prepare messages for the API
        messages = []
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
        
        # Make the API call
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:5000",  # Your site URL
                "X-Title": "OpenRouter Python Chat App",  # Your site name
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
