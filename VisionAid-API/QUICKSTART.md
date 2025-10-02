# ⚡ Quick Start - VisionAid

## 🚀 Chạy trong 30 giây

### 1. Chuẩn bị API Keys
Tạo file `.env`:
```
GEMINI_API_KEY=your_key_here
FPT_API_KEY=your_key_here
```

### 2. Cài đặt và chạy
```bash
# Tạo môi trường ảo
python3 -m venv venv

# Kích hoạt (Linux/Mac)
source venv/bin/activate
# Hoặc Windows: venv\Scripts\activate

# Cài đặt
pip install -r requirements.txt

# Chạy
python app.py
```

### 3. Sử dụng
Mở: http://localhost:8000

🎯 **Xong!** Kéo thả ảnh và nghe kết quả!

---

## 🔑 Lấy API Keys

- **Gemini**: https://aistudio.google.com/ (Free)
- **FPT.AI**: https://fpt.ai/ (Free tier available)

## 🎵 Giọng đọc
- `banmai` - Nam Bắc (default)
- `lannhi` - Nữ Bắc  
- `myan` - Nữ Nam
- `giahuy` - Nam trẻ
- `minhquang` - Nam Nam

## 🚨 Lỗi thường gặp
```bash
# Thiếu module
pip install -r requirements.txt

# Port đã dùng
lsof -ti:8000 | xargs kill -9

# API key sai
# Kiểm tra lại file .env
```