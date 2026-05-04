from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import torch

app = FastAPI(title="Grievance Classification API")

# Initialize the zero-shot classification pipeline
# We use 'facebook/bart-large-mnli' for high accuracy
# device=0 if torch.cuda.is_available() else -1
print("Loading AI Model (this may take a minute on first run)...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

class GrievanceRequest(BaseModel):
    text: str

class GrievanceResponse(BaseModel):
    category: str
    priority: str
    confidence: float

# Predefined categories for the city grievance system
CATEGORIES = [
    "Road Issues",
    "Sanitation",
    "Electricity",
    "Water Supply",
    "Public Safety",
    "Others"
]

# Priority labels
PRIORITY_LABELS = ["High", "Medium", "Low"]

@app.get("/")
async def root():
    return {"message": "AI Classification Service is Running"}

@app.post("/classify", response_model=GrievanceResponse)
async def classify_grievance(request: GrievanceRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")

    try:
        # Perform zero-shot classification for category
        category_result = classifier(request.text, candidate_labels=CATEGORIES)
        top_category = category_result['labels'][0]
        category_score = category_result['scores'][0]

        # Perform classification for priority
        # We define priority based on urgency and risk
        priority_prompt = "The priority of this issue is"
        priority_result = classifier(request.text, candidate_labels=PRIORITY_LABELS, hypothesis_template=priority_prompt + " {}.")
        top_priority = priority_result['labels'][0]

        return {
            "category": top_category,
            "priority": top_priority,
            "confidence": round(category_score, 4)
        }
    except Exception as e:
        print(f"Error during classification: {e}")
        raise HTTPException(status_code=500, detail="Internal AI Model Error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
