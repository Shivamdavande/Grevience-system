from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification

try:
    processor = AutoImageProcessor.from_pretrained('microsoft/swin-tiny-patch4-window7-224')
    model = AutoModelForImageClassification.from_pretrained('umm-maybe/AI-image-detector')
    ai_image_detector = pipeline('image-classification', model=model, image_processor=processor)
    print("Successfully loaded model with explicit processor.")
except Exception as e:
    print(f"Error: {e}")
