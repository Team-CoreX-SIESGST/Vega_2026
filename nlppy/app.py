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
        # Use complaint_text for prediction
        # In production, you might want to combine with category/priority from Gemini
        text = data.complaint_text
        
        # If category from Gemini is provided, you can use it to enhance the prediction
        # For now, we'll use the text-based model prediction
        dept = model.predict([text])[0]
        proba = model.predict_proba([text]).max()
        
        # If Gemini provided a category, we can optionally use it
        # This is a simple implementation - you might want more sophisticated logic
        if data.category:
            # You could add logic here to adjust confidence or department based on Gemini's category
            pass
        
        return {
            "department": dept,
            "confidence": float(proba),
            "gemini_category": data.category,  # Return Gemini category for reference
            "priority": data.priority
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok"}