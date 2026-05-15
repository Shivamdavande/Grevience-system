# AI Grievance System - AI Models Explained

Is document mein humne un sabhi AI models ke baare mein explain kiya hai jo is project mein use hue hain. Yahan humne bataya hai ki kaunsa model use kiya gaya hai, use kyun use kiya gaya hai, aur wo kaise kaam karta hai.

---

## 1. Text Classification Model
**Model Name:** `facebook/bart-large-mnli` (BART Large)

* **Ye kya hai:** Yeh ek Zero-Shot Text Classification model hai jo text ko samajhne aur classify karne ka kaam karta hai.
* **Kyun use kiya:** Jab koi citizen apni problem (grievance) text format mein likhta hai, toh ye model automatically samajh leta hai ki complaint kis department ki hai (jaise "Road Issues", "Water Supply", "Electricity") aur iski priority kya honi chahiye (High, Medium, Low).
* **Kaise kaam karta hai:** Yeh "Zero-shot classification" technique ka use karta hai. Iska matlab humein isko pehle se hazaron complaints par train karne ki zaroorat nahi hoti. Hum bas isko apne categories bata dete hain, aur yeh text ki meaning ko un categories se match karke sabse best fit bata deta hai.

---

## 2. Image Captioning Model
**Model Name:** `Salesforce/blip-image-captioning-base` (BLIP)

* **Ye kya hai:** Yeh ek Vision-Language model hai jo kisi bhi image ko dekh kar uske baare mein text description (caption) generate kar sakta hai.
* **Kyun use kiya:** Bahut baar log text type karne ke bajaye sirf problem ki photo khich kar upload kar dete hain. BLIP model us photo ko samajhta hai aur uska ek sentence banata hai (jaise "a photo of a broken pipe leaking water"). Phir is sentence ko BART model ko bhej kar problem classify ki jati hai.
* **Kaise kaam karta hai:** Yeh pehle image ke visual features ko nikalta hai, aur uske baad ek language model ka use karke step-by-step ek meaningful sentence banata hai jo image ko accurately describe karta hai. Isme humne repetitions rokne ke liye special parameters (repetition_penalty, no_repeat_ngram_size) bhi set kiye hain taki sahi output mile.

---

## 3. Fake / AI Image Detection Model
**Model Name:** `umm-maybe/AI-image-detector`

* **Ye kya hai:** Yeh ek Image Classification model hai jiska kaam yeh pehchanna hai ki koi image asli (real camera se kheenchi gayi) hai ya phir AI (jaise Midjourney ya DALL-E) se banayi gayi fake image hai.
* **Kyun use kiya:** System ko fraud complaints aur fake proofs se bachane ke liye. Agar koi citizen fake complaint darj karne ke liye AI-generated photo dalta hai, ya koi officer kaam pura dikhane ke liye fake photo upload karta hai, toh yeh model usko pakad leta hai.
* **Kaise kaam karta hai:** AI generated images mein kuch aise hidden patterns, pixels ya artifacts hote hain jo normal human aankhon ko nahi dikhte. Yeh model unhi patterns ko detect karta hai aur ek confidence score (percentage) deta hai ki image kitni "artificial" ya "fake" hai. Agar score 30% se jyada hota hai, toh hum usko AI-generated maan lete hain.

---

## 4. Image Comparison Model (Image Matching)
**Model Name:** `openai/clip-vit-base-patch32` (CLIP)

* **Ye kya hai:** Yeh OpenAI ka banaya gaya ek powerful model hai jo images ko mathematically samajhne mein expert hai.
* **Kyun use kiya:** Complaint aane par (Before image) aur resolve hone ke baad (After image) dono photos ko compare karne ke liye. Yeh ensure karta hai ki officer ne sach mein usi jagah aur usi problem ko fix kiya hai jiski complaint thi.
* **Kaise kaam karta hai:** Yeh dono images ko numbers ke ek array (vector) mein convert kar deta hai (jisey embeddings kehte hain). Fir yeh in dono vectors ke beech ki similarity nikalta hai (cosine similarity). Agar dono images ka vector aapas mein match karta hai aur score 70% se jyada aata hai, toh iska matlab dono images same problem ko show kar rahi hain.

---

**Summary:** 
Yeh charo AI models milkar is project ko completely smart banate hain. **BART** text ko samajhta hai, **BLIP** photos ko text mein badalta hai, **AI Detector** fakes ko pakadta hai, aur **CLIP** before/after photos ko match karke kaam ki verification karta hai.
