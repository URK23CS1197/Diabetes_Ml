import sys
import os
sys.path.insert(0, os.path.dirname(__file__))  # Allow importing main.py
#test_ml
from main import app
import pytest
from flask.testing import FlaskClient

@pytest.fixture
def client() -> FlaskClient:
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_predict_endpoint(client):
    data = {
        "Pregnancies": 6, "Glucose": 148, "BloodPressure": 72,
        "SkinThickness": 35, "Insulin": 0, "BMI": 33.6,
        "DiabetesPedigreeFunction": 0.627, "Age": 50
    }
    response = client.post('/predict', json=data)
    assert response.status_code == 200
    assert "prediction" in response.json