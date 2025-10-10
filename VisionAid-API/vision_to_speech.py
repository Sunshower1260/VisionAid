"""
VisionAid - Vision to Speech API
Simple and powerful API for converting images to speech, designed to help visually impaired people
access visual information through audio.
"""
import os
import time
import requests
from typing import Dict, Any
import google.generativeai as genai


class VTS:
    """
    VisionAid Vision to Speech - Convert images to audio files
    
    A simple yet powerful API that converts images to audio files,
    specifically designed to help visually impaired people access visual information.
    
    Features:
    - Smart image analysis using Google Gemini AI
    - Natural Vietnamese text-to-speech using FPT.AI
    - OCR for documents and contextual description for scenes
    """
    
    def __init__(self, gemini_api_key: str, fpt_api_key: str, voice: str = "banmai"):
        genai.configure(api_key=gemini_api_key)
        self.gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")
        self.fpt_api_key = fpt_api_key
        self.voice = voice
        
        self.prompt = """
Bạn là trợ lý hỗ trợ người khiếm thị.
Hãy phân loại ảnh thành một trong hai loại:
- [Tài liệu]: Nếu bức ảnh là tài liệu/trang giấy → OCR toàn bộ nội dung và format lại nội dung đó cho hoàn chỉnh, chỉnh chu và ngăn nắp, không tóm tắt.
- [Ngữ cảnh]: Nếu bức ảnh là cảnh vật/bối cảnh → chỉ cần miêu tả tóm tắt tổng thể.
Trả kết quả theo format:
Thể loại: [Tài liệu hoặc Ngữ cảnh]
Nội dung: <nội dung tương ứng>
"""

    def convert(self, image_path: str, output_path: str, wait_time: int = 10, max_retries: int = 60) -> Dict[str, Any]:
        """
        Convert an image to audio file using Gemini AI + FPT.AI TTS
        
        Args:
            image_path (str): Path to input image
            output_path (str): Desired output path (extension will match FPT.AI format)
            wait_time (int): Seconds to wait between retries
            max_retries (int): Max number of retries for audio generation
            
        Returns:
            Dict[str, Any]: Result containing success status, text, audio path, etc.
        """
        try:
            # gpt test route n response
            #Analyze image with Gemini
            print("🔍 Analyzing image...")
            if not os.path.exists(image_path):
                return {"success": False, "error": f"Image file not found: {image_path}"}

            with open(image_path, "rb") as f:
                image_bytes = f.read()

            response = self.gemini_model.generate_content([
                {"mime_type": "image/jpeg", "data": image_bytes},
                self.prompt
            ])
            text_result = response.text.strip()
            print(f"📄 Analysis result: {text_result[:200]}...")

            # Convert text to speech
            print("🔊 Converting to speech...")
            tts_url = "https://api.fpt.ai/hmi/tts/v5"
            headers = {
                "api-key": self.fpt_api_key,
                "speed": "",
                "voice": self.voice,
                "format": "mp3"
            }
            tts_response = requests.post(tts_url, data=text_result.encode("utf-8"), headers=headers)
            if tts_response.status_code != 200:
                return {"success": False, "error": f"TTS request failed ({tts_response.status_code})"}

            data = tts_response.json()
            audio_url = data.get("async")
            if not audio_url:
                return {"success": False, "error": "No audio URL returned from FPT.AI", "api_response": data}

            print(f"🔗 Audio URL: {audio_url}")

            # Wait for FPT.AI
            print(f"⏳ Waiting for audio generation (~{wait_time*max_retries}s max)...")
            audio_response = None
            for i in range(max_retries):
                time.sleep(wait_time)
                audio_response = requests.get(audio_url)
                if audio_response.status_code == 200:
                    print(f"✅ Audio ready after {i+1} retries (~{(i+1)*wait_time}s)")
                    break
                else:
                    print(f"⌛ Audio not ready yet (status {audio_response.status_code}), retry {i+1}/{max_retries}")

            if not audio_response or audio_response.status_code != 200:
                return {"success": False, "error": f"Failed to download audio after {max_retries*wait_time} seconds", "text_result": text_result, "audio_url": audio_url}

            # Save audio
            ext = os.path.splitext(audio_url)[-1] or ".mp3"
            output_file = os.path.splitext(output_path)[0] + ext
            output_dir = os.path.dirname(output_file)
            if output_dir:
                os.makedirs(output_dir, exist_ok=True)

            with open(output_file, "wb") as f:
                f.write(audio_response.content)

            print(f"✅ Successfully saved audio to: {output_file}")

            return {
                "success": True,
                "error": None,
                "text_result": text_result,
                "audio_path": output_file,
                "audio_url": audio_url,
                "voice_used": self.voice
            }

        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

    def set_voice(self, voice: str):
        """Change TTS voice"""
        self.voice = voice

    def set_prompt(self, prompt: str):
        """Change analysis prompt"""
        self.prompt = prompt

if __name__ == "__main__":
    vts = VTS(
        gemini_api_key="YOUR_GEMINI_API_KEY",
        fpt_api_key="YOUR_FPT_API_KEY",
        voice="banmai"
    )

    result = vts.convert(
        image_path="path/to/your/image.jpg",
        output_path="outputs/audio.mp3"  #.mp3
    )

    if result["success"]:
        print("✅ Conversion completed!")
        print(f"📄 Text: {result['text_result']}")
        print(f"🔊 Audio: {result['audio_path']}")
    else:
        print(f"❌ Conversion failed: {result['error']}")
