# � Hướng dẫn chạy VisionAid

## � Yêu cầu

- **Python 3.7+**
- **Kết nối Internet**
- **API Keys**: Gemini AI + FPT.AI TTS

## � Bước 1: Chuẩn bị API Keys

### Lấy API Keys:
- **Gemini AI**: https://aistudio.google.com/
- **FPT.AI TTS**: https://fpt.ai/

### Tạo file `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
FPT_API_KEY=your_fpt_api_key_here
DEFAULT_VOICE=banmai
```

⚠️ **Thay API keys thực tế của bạn!**

## ⚡ Bước 2: Cài đặt và chạy (3 bước đơn giản)

### 1. Tạo và kích hoạt môi trường ảo:
```bash
# Tạo môi trường ảo
python3 -m venv venv

# Kích hoạt môi trường ảo
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

### 2. Cài đặt dependencies:
```bash
pip install -r requirements.txt
```

### 3. Chạy ứng dụng:
```bash
python app.py
```

✅ **Xong!** Server sẽ chạy tại: http://localhost:8000

## 🌐 Truy cập ứng dụng

- **Web Interface**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📱 Cách sử dụng

1. Mở http://localhost:8000
2. Kéo thả ảnh vào trang web
3. Chọn giọng đọc
4. Nhấn "Chuyển đổi"
5. Nghe kết quả âm thanh

## � Troubleshooting

**Lỗi "Module not found":**
```bash
pip install -r requirements.txt
```

**Lỗi "API key not configured":**
- Kiểm tra file `.env` có đúng API keys chưa

**Lỗi "Port 8000 đã được sử dụng":**
```bash
# Kill process trên port 8000
lsof -ti:8000 | xargs kill -9
```

## 🎵 Giọng đọc có sẵn

- `banmai` - Nam miền Bắc (mặc định)
- `lannhi` - Nữ miền Bắc  
- `myan` - Nữ miền Nam
- `giahuy` - Nam trẻ
- `minhquang` - Nam miền Nam