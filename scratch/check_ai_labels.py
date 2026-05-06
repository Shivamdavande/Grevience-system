from transformers import pipeline

print("Loading model config...")
detector = pipeline("image-classification", model="umm-maybe/AI-image-detector")

print("Model Labels:", detector.model.config.id2label)
