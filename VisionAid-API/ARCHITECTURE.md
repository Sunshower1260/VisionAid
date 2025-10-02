# 🏗️ VisionAid FastAPI Architecture

## Kiến trúc hệ thống

```
VisionAid/
├── app.py                 # FastAPI main application
├── vision_to_speech.py    # Core VTS processing class
├── index.html             # Web interface
├── .env                   # Environment variables (API keys)
├── requirements.txt       # Python dependencies
├── start.sh              # Linux/Mac startup script
├── start.bat             # Windows startup script
├── uploads/              # Temporary upload directory
├── outputs/              # Generated audio files
└── static/               # Static assets (CSS, JS, images)
```

## Các thành phần chính

### 1. FastAPI Backend (`app.py`)
- **Endpoints**:
  - `GET /`: Serve HTML interface
  - `POST /upload`: Synchronous image to speech conversion
  - `POST /upload-async`: Asynchronous processing with task tracking
  - `GET /status/{task_id}`: Check conversion status
  - `GET /voices`: Available TTS voices
  - `GET /health`: Health check endpoint

### 2. Web Interface (`index.html`)
- **Features**:
  - Drag & drop image upload
  - Voice selection (5 Vietnamese voices)
  - Real-time progress tracking
  - Audio player with controls
  - Download generated audio
  - Responsive design for mobile

### 3. VTS Core (`vision_to_speech.py`)
- **AI Integration**:
  - Google Gemini AI for image analysis
  - FPT.AI TTS for Vietnamese speech synthesis
  - Smart document OCR vs context description

## API Endpoints

### Upload Image (Sync)
```http
POST /upload
Content-Type: multipart/form-data

file: <image_file>
voice: banmai|lannhi|myan|giahuy|minhquang
wait_time: integer (5-30 seconds)
```

### Upload Image (Async)
```http
POST /upload-async
Content-Type: multipart/form-data

file: <image_file>
voice: banmai|lannhi|myan|giahuy|minhquang
wait_time: integer (5-30 seconds)
```

### Check Status
```http
GET /status/{task_id}
```

### Available Voices
```http
GET /voices
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Conversion completed successfully!",
  "text_result": "Analyzed content...",
  "audio_url": "/outputs/audio_file.wav",
  "audio_filename": "audio_file.wav",
  "voice_used": "banmai"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Conversion failed",
  "error": "Error description"
}
```

## Workflow

1. **Image Upload**:
   - User selects/drags image to web interface
   - Client validates file type and size
   - Image uploaded to `/uploads/` directory

2. **Processing**:
   - VTS analyzes image with Gemini AI
   - Classifies as Document (OCR) or Context (Description)
   - Sends text to FPT.AI for TTS conversion
   - Downloads and saves audio to `/outputs/`

3. **Response**:
   - Returns JSON with success status and audio URL
   - Web interface displays results and audio player
   - User can play audio or download WAV file

## Security Features

- ✅ File type validation (images only)
- ✅ File size limits (10MB max)
- ✅ Environment variables for API keys
- ✅ Automatic cleanup of old files
- ✅ CORS configuration for web access
- ✅ Input sanitization

## Scalability Features

- 🚀 Asynchronous processing with background tasks
- 🚀 Task status tracking
- 🚀 File cleanup system
- 🚀 Progress indicators
- 🚀 Error handling and recovery

## Deployment Ready

- 📦 Complete dependency management
- 📦 Cross-platform startup scripts
- 📦 Health check endpoint
- 📦 Production-ready configuration
- 📦 Static file serving
- 📦 API documentation (FastAPI auto-generated)