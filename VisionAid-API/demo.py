"""
Demo sử dụng VisionAid - vision_to_speech.py
"""
import os
from vision_to_speech import VTS

# Load environment variables from .env file
def load_env():
    """Load environment variables from .env file"""
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, 'r') as file:
            for line in file:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value

def main():
    # Load environment variables from .env file
    load_env()
    
    # Khởi tạo với API keys từ environment variables
    gemini_key = os.getenv("GEMINI_API_KEY")
    fpt_key = os.getenv("FPT_API_KEY")
    
    if not gemini_key or gemini_key == "YOUR_GEMINI_API_KEY_HERE":
        print("❌ Error: Please set your GEMINI_API_KEY in .env file")
        print("💡 Copy .env.example to .env and add your real API keys")
        return
        
    if not fpt_key or fpt_key == "YOUR_FPT_API_KEY_HERE":
        print("❌ Error: Please set your FPT_API_KEY in .env file")
        print("💡 Copy .env.example to .env and add your real API keys")
        return
    
    vts = VTS(
        gemini_api_key=gemini_key,
        fpt_api_key=fpt_key,
        voice=os.getenv("DEFAULT_VOICE", "banmai")
    )
    
    # Đường dẫn ảnh để test (thay bằng đường dẫn ảnh thực tế của bạn)
    image_path = r"G:\My Drive\DSP391m\481191925_1249528846840541_6357321759927879116_n.jpg"  # Thay bằng đường dẫn ảnh thực tế
    output_path = "output.wav"
    
    print("🚀 Starting image to speech conversion...")
    
    # Chuyển đổi ảnh thành âm thanh
    result = vts.convert(
        image_path=image_path,
        output_wav_path=output_path,
        wait_time=10
    )
    
    # Hiển thị kết quả
    if result["success"]:
        print("\n" + "="*50)
        print("✅ CONVERSION COMPLETED SUCCESSFULLY!")
        print("="*50)
        print(f"📄 Analysis Result:")
        print(result['text_result'])
        print(f"\n🔊 Audio saved to: {result['audio_path']}")
        print(f"🎵 Voice used: {result['voice_used']}")
        print(f"🔗 Audio URL: {result['audio_url']}")
    else:
        print("\n" + "="*50)
        print("❌ CONVERSION FAILED!")
        print("="*50)
        print(f"Error: {result['error']}")
    
    print("\n🎯 Demo completed!")
    print("\n💡 Tip: Create a .env file from .env.example to store your API keys securely!")

if __name__ == "__main__":
    main()