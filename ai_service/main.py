from fastapi import FastAPI, HTTPException, File, UploadFile
from pydantic import BaseModel
from transformers import pipeline, BlipProcessor, BlipForConditionalGeneration, CLIPProcessor, CLIPModel
from PIL import Image
import torch
import torch.nn.functional as F
import io

app = FastAPI(title="Grievance Classification API")

# Initialize models
print("Loading Text Classifier (BART)...")
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

print("Loading Image Captioner (BLIP)...")
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

print("Loading AI Image Detector...")
from transformers import AutoImageProcessor, AutoModelForImageClassification
ai_detector_processor = AutoImageProcessor.from_pretrained('microsoft/swin-tiny-patch4-window7-224')
ai_detector_model = AutoModelForImageClassification.from_pretrained('umm-maybe/AI-image-detector')
ai_image_detector = pipeline("image-classification", model=ai_detector_model, image_processor=ai_detector_processor)

print("Loading Image Comparison Model (CLIP)...")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

print("All models loaded successfully!")

class GrievanceRequest(BaseModel):
    text: str

class GrievanceResponse(BaseModel):
    category: str
    priority: str
    confidence: float
    description: str = ""

CATEGORIES = ["Road Issues", "Sewage Issues", "Waste & Garbage", "Water Supply", "Electricity & Lights", "Others"]
PRIORITY_LABELS = ["High", "Medium", "Low"]

@app.get("/")
async def root():
    return {"message": "AI Service Running", "clip_loaded": clip_model is not None}

@app.post("/classify", response_model=GrievanceResponse)
async def classify_grievance(request: GrievanceRequest):
    result = run_classification(request.text)
    return result

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    
    # Using a simpler prompt or no prompt to avoid triggering repetition loops
    # BLIP sometimes loops when forced with specific prompts
    prompt = "a photo of"
    inputs = blip_processor(image, text=prompt, return_tensors="pt")
    
    # Robust generation parameters to prevent repetition
    output = blip_model.generate(
        **inputs, 
        max_new_tokens=40,
        min_length=10, 
        num_beams=7, # More beams for better quality
        no_repeat_ngram_size=3, # Strictly prevent 3-gram repetitions
        repetition_penalty=1.8, # Stronger penalty for repeating words
        early_stopping=True
    )
    
    caption = blip_processor.decode(output[0], skip_special_tokens=True)
    
    # Post-process: Remove the prompt and any lingering "moped" style loops
    if caption.startswith(prompt):
        caption = caption[len(prompt):].strip()
    
    # Final cleanup of common hallucinated repetitions
    words = caption.split()
    unique_words = []
    for w in words:
        if not unique_words or w != unique_words[-1]: # Simple adjacent word de-duplication
            unique_words.append(w)
    caption = " ".join(unique_words)
        
    result = run_classification(caption)
    result["description"] = caption
    return result

def run_classification(text: str):
    category_result = classifier(text, candidate_labels=CATEGORIES)
    priority_result = classifier(text, candidate_labels=PRIORITY_LABELS, hypothesis_template="The priority of this issue is {}.")
    return {
        "category": category_result['labels'][0],
        "priority": priority_result['labels'][0],
        "confidence": round(category_result['scores'][0], 4),
        "description": text
    }

@app.post("/detect-ai-image")
async def detect_ai_image(file: UploadFile = File(...)):
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data)).convert("RGB")
    results = ai_image_detector(image)
    print(f"AI Detection Raw Results: {results}")
    ai_confidence = 0
    for r in results:
        if r['label'].lower() in ['artificial', 'ai', 'fake', 'synthetic', 'generated']:
            ai_confidence = max(ai_confidence, r['score'])
    
    is_ai = ai_confidence > 0.05
    print(f"AI Confidence: {ai_confidence}, Is AI: {is_ai}")
    return {"is_ai_generated": is_ai, "confidence": round(ai_confidence * 100, 2)}

@app.post("/compare-images")
async def compare_images(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    try:
        img1 = Image.open(io.BytesIO(await file1.read())).convert("RGB")
        img2 = Image.open(io.BytesIO(await file2.read())).convert("RGB")
        
        inputs1 = clip_processor(images=img1, return_tensors="pt")
        inputs2 = clip_processor(images=img2, return_tensors="pt")
        
        with torch.no_grad():
            # Using vision_model to get the pooled output directly
            v1 = clip_model.vision_model(**inputs1).pooler_output
            v2 = clip_model.vision_model(**inputs2).pooler_output
            
            # Normalize
            v1 = F.normalize(v1, p=2, dim=-1)
            v2 = F.normalize(v2, p=2, dim=-1)
            
            sim = torch.matmul(v1, v2.T).item()
            
        score = max(0, round(sim * 100, 2))
        return {"similarity_score": score, "is_match": score > 70.0}
    except Exception as e:
        return {"error": str(e), "similarity_score": 0, "is_match": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
