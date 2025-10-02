# 👁️‍🗨️ VisionAid - Vision to Speech (VTS) API

![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)
![TTS](https://img.shields.io/badge/TTS-FPT.AI-green.svg)
![Accessibility](https://img.shields.io/badge/Accessibility-♿-purple.svg)

VisionAid là một API đơn giản và mạnh mẽ để chuyển đổi hình ảnh thành âm thanh, được thiết kế đặc biệt để hỗ trợ người khiếm thị tiếp cận thông tin hình ảnh một cách dễ dàng.

## � Về VisionAid

VisionAid sử dụng công nghệ AI tiên tiến để biến hình ảnh thành những mô tả âm thanh chi tiết, giúp người khiếm thị có thể "nhìn" thấy thế giới xung quanh thông qua âm thanh. Dự án kết hợp Google Gemini AI để phân tích hình ảnh và FPT.AI TTS để tạo ra giọng nói tự nhiên bằng tiếng Việt.

## �🎯 Tính năng

- **Phân tích ảnh thông minh**: Sử dụng Google Gemini AI để:
  - OCR tài liệu và format lại nội dung
  - Mô tả cảnh vật và bối cảnh
- **Chuyển đổi văn bản thành giọng nói**: Sử dụng FPT.AI TTS với nhiều giọng Việt Nam
- **API đơn giản**: Chỉ cần 1 dòng import và sử dụng

## 🚀 Cài đặt

### Yêu cầu
```bash
pip install -r requirements.txt
```

### Dependencies
- `requests`: Để gọi API
- `google-generativeai`: Để phân tích hình ảnh
- `time`, `os`: Built-in Python modules

## 📖 Sử dụng cơ bản

### Import và khởi tạo
```python
from vision_to_speech import VTS

# Khởi tạo với API keys
vts = VTS(
    gemini_api_key="YOUR_GEMINI_API_KEY",
    fpt_api_key="YOUR_FPT_API_KEY", 
    voice="banmai"  # Optional: lannhi, myan, giahuy, minhquang
)
```

### Chuyển đổi hình ảnh thành âm thanh
```python
# Chuyển đổi đơn giản
result = vts.convert(
    image_path="path/to/your/image.jpg",
    output_wav_path="output.wav"
)

if result["success"]:
    print(f"✅ Success! Audio saved to: {result['audio_path']}")
    print(f"📄 Analysis: {result['text_result']}")
else:
    print(f"❌ Error: {result['error']}")
```

## 🔧 API Reference

### Class: `VTS`

#### `__init__(gemini_api_key, fpt_api_key, voice="banmai")`
Khởi tạo VTS instance.

**Parameters:**
- `gemini_api_key` (str): Google Gemini API key
- `fpt_api_key` (str): FPT.AI TTS API key  
- `voice` (str): Giọng đọc (banmai, lannhi, myan, giahuy, minhquang)

#### `convert(image_path, output_wav_path, wait_time=10)`
Chuyển đổi hình ảnh thành file WAV.

**Parameters:**
- `image_path` (str): Đường dẫn đến file hình ảnh
- `output_wav_path` (str): Đường dẫn lưu file WAV
- `wait_time` (int): Thời gian chờ TTS (giây)

**Returns:**
```python
{
    "success": bool,           # Trạng thái thành công
    "error": str or None,      # Thông báo lỗi (nếu có)
    "text_result": str,        # Kết quả phân tích văn bản
    "audio_path": str,         # Đường dẫn file audio
    "audio_url": str,          # URL audio từ FPT.AI
    "voice_used": str          # Giọng đã sử dụng
}
```

#### `set_voice(voice)`
Thay đổi giọng đọc.

#### `set_prompt(prompt)`
Tùy chỉnh prompt phân tích hình ảnh.

## 📋 Ví dụ chi tiết

### Ví dụ 1: Sử dụng cơ bản
```python
from vision_to_speech import VTS

vts = VTS(
    gemini_api_key="your-gemini-key",
    fpt_api_key="your-fpt-key"
)

result = vts.convert("document.jpg", "output.wav")
print(result["text_result"])  # In kết quả phân tích
```

### Ví dụ 2: Tùy chỉnh giọng và thời gian chờ
```python
vts = VTS(
    gemini_api_key="your-gemini-key", 
    fpt_api_key="your-fpt-key",
    voice="lannhi"  # Giọng nữ
)

result = vts.convert(
    image_path="image.jpg",
    output_wav_path="result.wav", 
    wait_time=15  # Chờ 15 giây
)
```

### Ví dụ 3: Tùy chỉnh prompt
```python
vts = VTS("gemini-key", "fpt-key")

# Tùy chỉnh prompt cho mục đích cụ thể
custom_prompt = """
Hãy mô tả chi tiết màu sắc và đối tượng trong ảnh.
Tập trung vào thông tin hữu ích cho người khiếm thị.
"""
vts.set_prompt(custom_prompt)

result = vts.convert("photo.jpg", "description.wav")
```

## 🎵 Giọng đọc có sẵn

- `banmai` - Giọng nam miền Bắc (mặc định)
- `lannhi` - Giọng nữ miền Bắc  
- `myan` - Giọng nữ miền Nam
- `giahuy` - Giọng nam trẻ
- `minhquang` - Giọng nam miền Nam

## 🔑 Lấy API Keys

### Google Gemini API
1. Truy cập [Google AI Studio](https://aistudio.google.com/)
2. Tạo API key mới
3. Copy API key để sử dụng

### FPT.AI TTS API  
1. Đăng ký tại [FPT.AI](https://fpt.ai/)
2. Tạo ứng dụng TTS
3. Copy API key từ dashboard

## 🚨 Lưu ý bảo mật

- **KHÔNG** commit API keys vào source code
- Sử dụng environment variables:
```python
import os
vts = VTS(
    gemini_api_key=os.getenv("GEMINI_API_KEY"),
    fpt_api_key=os.getenv("FPT_API_KEY")
)
```

## 📁 Cấu trúc file

```
VisionAid/
├── vision_to_speech.py    # Main API file
├── demo.py               # Demo usage
├── requirements.txt      # Dependencies
├── LICENSE               # License file
└── README.md            # Documentation
```

## 🔧 Troubleshooting

### Lỗi "Import could not be resolved"
Cài đặt dependencies:
```bash
pip install requests google-generativeai
```

### Lỗi "Image file not found"
Kiểm tra đường dẫn file hình ảnh:
```python
import os
print(os.path.exists("your-image-path.jpg"))
```

### Lỗi TTS timeout
Tăng `wait_time`:
```python
result = vts.convert("image.jpg", "output.wav", wait_time=20)
```

### Lỗi API key
Kiểm tra API keys hợp lệ và còn quota.

## 🤝 Đóng góp cho VisionAid

VisionAid là một dự án mã nguồn mở nhằm hỗ trợ cộng đồng người khiếm thị. Chúng tôi hoan nghênh mọi đóng góp:

- 🐛 Báo cáo lỗi và đề xuất tính năng
- 💡 Cải thiện thuật toán phân tích hình ảnh  
- 🌍 Hỗ trợ thêm ngôn ngữ khác
- � Cập nhật documentation
- 🎯 Tối ưu hiệu suất và độ chính xác

## �📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra API keys và network connection
2. Xem log error chi tiết trong response
3. Tham khảo documentation của [Google Gemini](https://ai.google.dev/) và [FPT.AI](https://fpt.ai/)
4. Tạo issue trên GitHub repository để được hỗ trợ

---

**VisionAid** - Mang ánh sáng đến cho thế giới thông qua công nghệ 🌟