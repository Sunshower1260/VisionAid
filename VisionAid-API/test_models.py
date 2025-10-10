import google.generativeai as genai

genai.configure(api_key="AIzaSyAYMrpt2N38uFsGOEn-mLrsAM_-Bp1nPvE")
# 
print("test model gemini:")
for model in genai.list_models():
    print(" -", model.name)
