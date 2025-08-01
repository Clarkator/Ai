# diagnosis.py
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data import dataset

symptoms_list = [entry["symptoms"] for entry in dataset]
diagnoses = [entry["diagnosis"] for entry in dataset]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(symptoms_list)

def predict_diagnosis(user_input):
    user_vec = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vec, X).flatten()
    best_match_index = similarities.argmax()
    confidence = round(similarities[best_match_index] * 100, 2)

    if confidence < 30:
        return "Sorry, I couldn’t identify the condition confidently. Please consult a doctor."

    return f"Possible diagnosis: {diagnoses[best_match_index]} (Confidence: {confidence}%)"
