# Implementation Plan - Image-Based Grievance Reporting

This feature allows users to report issues by simply taking a photo. The AI will analyze the image, generate a description, and automatically assign it to the correct department (e.g., PWD for potholes).

## User Review Required

> [!IMPORTANT]
> **AI Model**: I will use **BLIP (Bootstrapping Language-Image Pre-training)** for image captioning. It's a powerful open-source model that can describe images in natural language.
> **Storage**: Uploaded images will be stored locally in the `server/uploads` directory for now.

## Proposed Changes

### AI Service (Python)

#### [MODIFY] [requirements.txt](file:///d:/AI%20%20Based%20grieveance%20system/ai_service/requirements.txt)
- Add `pillow` and `python-multipart`.

#### [MODIFY] [main.py](file:///d:/AI%20%20Based%20grieveance%20system/ai_service/main.py)
- Initialize `image-to-text` pipeline.
- Add `POST /analyze-image` endpoint that accepts an image file, generates a caption, and then runs the zero-shot classifier on that caption.

---

### Backend (Node.js)

#### [MODIFY] [package.json](file:///d:/AI%20%20Based%20grieveance%20system/server/package.json)
- Add `multer` for handling file uploads.

#### [MODIFY] [Grievance.js](file:///d:/AI%20%20Based%20grieveance%20system/server/models/Grievance.js)
- Add `imageUrl` and `imageDescription` fields.

#### [MODIFY] [index.js](file:///d:/AI%20%20Based%20grieveance%20system/server/index.js)
- Setup `multer` middleware.
- Create a new endpoint or update the existing one to handle `multipart/form-data`.
- Forward the image to the AI service.

---

### Frontend (React)

#### [MODIFY] [GrievanceForm.jsx](file:///d:/AI%20%20Based%20grieveance%20system/client/src/components/GrievanceForm.jsx)
- Add an image upload component (using a camera icon).
- When an image is uploaded:
    - Automatically call the AI analysis endpoint.
    - Populate the "Description" field with the AI-generated caption.
    - Show a preview of the image.

## Verification Plan

### Automated Tests
- Test `/analyze-image` with a sample photo of a pothole.
- Verify image is saved in `uploads/` folder.

### Manual Verification
- Upload a photo of trash and verify AI classifies it as "Sanitation".
- Upload a photo of a broken wire and verify AI classifies it as "Electricity".
- Check if the PWD department is correctly assigned for road issues.
