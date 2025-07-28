from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
from scipy.sparse import hstack
import numpy as np

app = Flask(__name__)
CORS(app)

with open('best_personality_model.pkl', 'rb') as f:
    personality_data = pickle.load(f)
    personality_model = personality_data['model']

with open('best_adoption_model.pkl', 'rb') as f:
    adoption_data = pickle.load(f)
    adoption_model = adoption_data['model']

with open('encoders.pkl', 'rb') as f:
    encoders = pickle.load(f)
    onehot = encoders['onehot']
    scaler = encoders['scaler']
    vectorizer = encoders['vectorizer']
    categorical_cols = encoders['categorical_cols']
    numerical_cols = encoders['numerical_cols']

PERSONALITY_TYPES = [
    "Energetic/Playful",
    "Calm/Relaxed",
    "Shy/Timid",
    "Friendly/Social",
    "Independent/Aloof",
    "Protective/Guarding"
]

ADOPTION_SPEED = [
    "Same Day Adoption",
    "1-7 Days",
    "8-30 Days",
    "31-90 Days",
    "No Adoption After 90 Days"
]

@app.route("/predict_personality", methods=["POST"])
def predict_personality():
    try:
        data = request.get_json()

        input_df = pd.DataFrame([{
            'PetType': data['specie'],
            'Breed': data['breed'],
            'AgeMonths': float(data['age']) * 12,
            'Color': data['colorMarkings'],
            'Size': data['size'],
            'Vaccinated': 1 if data['vaccinationStatus'] == 'Up-to-date' else 0,
            'AdoptionFee': float(data['adoptionFee']),
            'BehaviorDesc': data['behavior']
        }])

        # Transform features
        cat_features = onehot.transform(input_df[categorical_cols])
        num_features = scaler.transform(input_df[numerical_cols])
        text_features = vectorizer.transform(input_df['BehaviorDesc'])

        features = hstack([cat_features, num_features, text_features])

        # Predict personality
        prediction = personality_model.predict(features)
        pred_index = int(prediction[0])

        if pred_index >= len(PERSONALITY_TYPES):
            return jsonify({
                "error": f"Predicted index {pred_index} exceeds PERSONALITY_TYPES list size {len(PERSONALITY_TYPES)}"
            }), 500

        personality = PERSONALITY_TYPES[pred_index]

        proba = personality_model.predict_proba(features)[0]
        personality_probs = {
            PERSONALITY_TYPES[i]: float(proba[i])
            for i in range(min(len(proba), len(PERSONALITY_TYPES)))
        }

        return jsonify({
            'prediction': personality,
            'probabilities': personality_probs,
            'model_used': personality_data.get('model_name', 'Unknown'),
            'model_accuracy': personality_data.get('accuracy', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route("/predict_adoption", methods=["POST"])
def predict_adoption():
    try:
        data = request.get_json()

        input_df = pd.DataFrame([{
            'PetType': data['specie'],
            'Breed': data['breed'],
            'AgeMonths': float(data['age']) * 12,
            'Color': data['colorMarkings'],
            'Size': data['size'],
            'Vaccinated': 1 if data['vaccinationStatus'] == 'Up-to-date' else 0,
            'AdoptionFee': float(data['adoptionFee'])
        }])

        cat_features = onehot.transform(input_df[categorical_cols])
        num_features = scaler.transform(input_df[numerical_cols])
        features = hstack([cat_features, num_features])

        prediction = adoption_model.predict(features)
        pred_index = int(prediction[0])

        if pred_index >= len(ADOPTION_SPEED):
            return jsonify({
                "error": f"Predicted index {pred_index} exceeds ADOPTION_SPEED list size {len(ADOPTION_SPEED)}"
            }), 500

        adoption_speed = ADOPTION_SPEED[pred_index]

        proba = adoption_model.predict_proba(features)[0]
        adoption_probs = {
            ADOPTION_SPEED[i]: float(proba[i])
            for i in range(min(len(proba), len(ADOPTION_SPEED)))
        }

        return jsonify({
            'prediction': adoption_speed,
            'probabilities': adoption_probs,
            'model_used': adoption_data.get('model_name', 'Unknown'),
            'model_accuracy': adoption_data.get('accuracy', 0)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route("/predict_both", methods=["POST"])
def predict_both():
    try:
        data = request.get_json()

        input_df = pd.DataFrame([{
            'PetType': data['specie'],
            'Breed': data['breed'],
            'AgeMonths': float(data['age']) * 12,
            'Color': data['colorMarkings'],
            'Size': data['size'],
            'Vaccinated': 1 if data['vaccinationStatus'] == 'Up-to-date' else 0,
            'AdoptionFee': float(data['adoptionFee']),
            'BehaviorDesc': data['behavior']
        }])

        cat_features = onehot.transform(input_df[categorical_cols])
        num_features = scaler.transform(input_df[numerical_cols])
        text_features = vectorizer.transform(input_df['BehaviorDesc'])

        personality_features = hstack([cat_features, num_features, text_features])
        personality_pred = personality_model.predict(personality_features)
        personality_proba = personality_model.predict_proba(personality_features)[0]
        
        adoption_features = hstack([cat_features, num_features])
        adoption_pred = adoption_model.predict(adoption_features)
        adoption_proba = adoption_model.predict_proba(adoption_features)[0]

        # Safely get personality prediction
        personality_index = personality_pred[0]
        if personality_index >= len(PERSONALITY_TYPES):
            personality_label = "Unknown"
        else:
            personality_label = PERSONALITY_TYPES[personality_index]

        # Safely get adoption prediction
        adoption_index = adoption_pred[0]
        if adoption_index >= len(ADOPTION_SPEED):
            adoption_label = "Unknown"
        else:
            adoption_label = ADOPTION_SPEED[adoption_index]

        return jsonify({
            'personality': {
                'prediction': personality_label,
                'probabilities': {
                    PERSONALITY_TYPES[i]: float(personality_proba[i]) 
                    for i in range(min(len(personality_proba), len(PERSONALITY_TYPES)))
                },
                'model_used': personality_data.get('model_name', 'Unknown'),
                'model_accuracy': personality_data.get('accuracy', 0)
            },
            'adoption': {
                'prediction': adoption_label,
                'probabilities': {
                    ADOPTION_SPEED[i]: float(adoption_proba[i])
                    for i in range(min(len(adoption_proba), len(ADOPTION_SPEED)))
                },
                'model_used': adoption_data.get('model_name', 'Unknown'),
                'model_accuracy': adoption_data.get('accuracy', 0)
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
