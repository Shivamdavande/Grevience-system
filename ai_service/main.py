from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image
import torch
import io

app = FastAPI(title="Grievance Classification API")

# Initialize models
print("Loading Text Classifier (BART)...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

print("Loading Image Captioner (BLIP)...")
image_captioner = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")

class GrievanceRequest(BaseModel):
    text: str

class GrievanceResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    description: str = ""

# Predefined categories
CATEGORIES = [
    "Road Issues",
    "Sewage Issues",
    "Waste & Garbage",
    "Water Supply",
    "Electricity & Lights",
    "Others"
]

PRIORITY_LABELS = ["High", "Medium", "Low"]

@app.get("/")
async def root():
    return {"message": "AI Classification Service is Running"}

@app.post("/classify", response_model=GrievanceResponse)
async def classify_grievance(request: GrievanceRequest):
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = run_classification(request.text)
    return result

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    try:
        # 1. Read image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data))

        # 2. Generate Caption
        print("Generating image caption...")
        caption_result = image_captioner(image)
        caption = caption_result[0]['generated_text']
        print(f"Caption: {caption}")

        # 3. Classify the caption
        result = run_classification(caption)
        result["description"] = caption
        
        return result
    except Exception as e:
        print(f"Error analyzing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def run_classification(text: str):
    try:
        # Category
        category_result = classifier(text, candidate_labels=CATEGORIES)
        top_category = category_result['labels'][0]
        category_score = category_result['scores'][0]

        # Priority
        priority_prompt = "The priority of this issue is"
        priority_result = classifier(text, candidate_labels=PRIORITY_LABELS, hypothesis_template=priority_prompt + " {}.")
        top_priority = priority_result['labels'][0]

        return {
            "category": top_category,
            "priority": top_priority,
            "confidence": round(category_score, 4),
            "description": text
        }
    except Exception as e:
        print(f"Classification error: {e}")
        return {
            "category": "Others",
            "priority": "Low",
            "confidence": 0,
            "description": text
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
