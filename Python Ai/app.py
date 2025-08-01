# app.py
import gradio as gr
from diagnosis import predict_diagnosis

def chat(symptoms):
    return predict_diagnosis(symptoms)

gr.Interface(
    fn=chat,
    inputs=gr.Textbox(lines=2, placeholder="Describe your symptoms..."),
    outputs="text",
    title="🩺 Symptom Checker AI",
    description="Type your symptoms and get a possible diagnosis. Not a substitute for medical advice."
).launch()
