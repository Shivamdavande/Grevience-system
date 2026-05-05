# Walkthrough - Image-Based Grievance Reporting

## Update: Automatic Image Description
I have enhanced the system so that the AI automatically writes the description as soon as you upload a photo.

### How it works now:
1. **Upload Photo**: Click the Camera icon and select a photo (e.g., a broken road).
2. **AI Reading**: You will see a loader saying **"AI is reading photo..."** directly on the image.
3. **Auto-Fill**: Once the AI finishes reading, the **"Describe the Issue"** text area will be automatically filled with what the AI saw (e.g., "a pothole in the middle of a street").
4. **Instant Feedback**: You can see what the AI understood before you even hit submit.

### Fixes:
- Resolved the issue where images were submitted without descriptions.
- Improved classification accuracy by ensuring the AI-generated caption is used for department assignment.

## Technical Changes
- **New API**: Added `/api/analyze-image` to the Node.js server for instant feedback.
- **Frontend State**: Added `analyzingImage` state to handle the asynchronous AI call during file selection.
