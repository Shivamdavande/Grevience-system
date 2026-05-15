import requests
import json
url = "https://huggingface.co/umm-maybe/AI-image-detector/raw/main/config.json"
r = requests.get(url)
print(json.dumps(r.json(), indent=2))
