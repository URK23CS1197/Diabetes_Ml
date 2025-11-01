# backend/main.py
from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)   # ← Allows React (localhost:3000) to call this API

# Load model – make sure diabetes_model.pkl is in the same folder
model = joblib.load("diabetes_model.pkl")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        features = [data[f] for f in [
            "Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"
        ]]
        input_array = np.array(features).reshape(1, -1)
        prediction = int(model.predict(input_array)[0])
        result = "Diabetic" if prediction == 1 else "Non-Diabetic"
        return jsonify({'prediction': result})
    except KeyError as e:
        return jsonify({'error': f'Missing feature: {e}'}), 400
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

if __name__ == '__main__':
    # ← Bind to 0.0.0.0 so React can reach it
    app.run(host='0.0.0.0', port=5000, debug=True)