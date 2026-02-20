from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import numpy as np

# Load model
model = joblib.load('department_classifier.pkl')

app = FastAPI()

class ComplaintData(BaseModel):
    complaint_text: str
    category: str = None      # optional, from Gemini
    priority: str = None
    train_number: str = None
    location: str = None

@app.post("/classify")
def classify(data: ComplaintData):
    try:
        # For now, use only complaint_text; you can concatenate other fields later
        text = data.complaint_text
        # Predict
        dept = model.predict([text])[0]
        proba = model.predict_proba([text]).max()
        return {
            "department": dept,
            "confidence": float(proba)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}