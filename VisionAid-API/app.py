"""
VisionAid FastAPI Web Application
Simple web interface for Vision to Speech conversion
"""
import os
import uuid
import shutil
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from base64 import b64decode
from io import BytesIO
from fastapi import FastAPI, Request
from PIL import Image
import base64
import traceback

from vision_to_speech import VTS

from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


# Load environment variables
def load_env():
    """Load environment variables from .env file"""
    env_path = ".env"
    if os.path.exists(env_path):
        with open(env_path, 'r') as file:
            for line in file:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.strip().split('=', 1)
                    # Remove extra spaces around the key and value
                    key = key.strip()
                    value = value.strip()
                    os.environ[key] = value

# Load environment variables
load_env()

# Create directories for uploads and outputs
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
STATIC_DIR = Path("static")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="VisionAid - Vision to Speech API",
    description="Convert images to speech for visually impaired users",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Global VTS instance
vts_instance = None

def get_vts_instance():
    """Get or create VTS instance"""
    global vts_instance
    if vts_instance is None:
        gemini_key = os.getenv("GEMINI_API_KEY")
        fpt_key = os.getenv("FPT_API_KEY")
        
        if not gemini_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")
        if not fpt_key:
            raise HTTPException(status_code=500, detail="FPT_API_KEY not configured")
        
        vts_instance = VTS(
            gemini_api_key=gemini_key,
            fpt_api_key=fpt_key,
            voice=os.getenv("DEFAULT_VOICE", "banmai")
        )
    return vts_instance

# Pydantic models
class ConversionResponse(BaseModel):
    success: bool
    message: str
    text_result: Optional[str] = None
    audio_url: Optional[str] = None
    audio_filename: Optional[str] = None
    voice_used: Optional[str] = None
    error: Optional[str] = None

class ConversionStatus(BaseModel):
    task_id: str
    status: str  # "processing", "completed", "failed"
    progress: int  # 0-100
    result: Optional[ConversionResponse] = None

# In-memory task storage (in production, use Redis or database)
conversion_tasks = {}

@app.get("/", response_class=HTMLResponse)
async def home():
    """Serve the main HTML page"""
    return FileResponse("index.html")

@app.post("/upload", response_model=ConversionResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice: str = Form("banmai"),
    wait_time: int = Form(10)
):
    """
    Upload image and convert to speech
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
            raise HTTPException(status_code=400, detail="Unsupported image format")
        
        unique_id = str(uuid.uuid4())
        upload_filename = f"{unique_id}{file_extension}"
        upload_path = UPLOAD_DIR / upload_filename
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Generate output filename
        output_filename = f"{unique_id}.mp3"
        output_path = OUTPUT_DIR / output_filename
        
        # Get VTS instance
        vts = get_vts_instance()
        vts.set_voice(voice)
        
        # Perform conversion
        result = vts.convert(
            image_path=str(upload_path),
            output_wav_path=str(output_path),
            wait_time=wait_time
        )
        
        # Clean up uploaded file
        try:
            os.remove(upload_path)
        except:
            pass
        
        if result["success"]:
            return ConversionResponse(
                success=True,
                message="Conversion completed successfully!",
                text_result=result["text_result"],
                audio_url=f"/outputs/{output_filename}",
                audio_filename=output_filename,
                voice_used=result["voice_used"]
            )
        else:
            # Clean up output file if exists
            try:
                if os.path.exists(output_path):
                    os.remove(output_path)
            except:
                pass
            
            return ConversionResponse(
                success=False,
                message="Conversion failed",
                error=result["error"]
            )
    
    except Exception as e:
        # Clean up files
        try:
            if os.path.exists(upload_path):
                os.remove(upload_path)
            if os.path.exists(output_path):
                os.remove(output_path)
        except:
            pass
        
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")

@app.post("/upload-async")
async def upload_image_async(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    voice: str = Form("banmai"),
    wait_time: int = Form(10)
):
    """
    Upload image and convert to speech asynchronously
    Returns task ID for status checking
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate task ID
    task_id = str(uuid.uuid4())
    
    # Initialize task status
    conversion_tasks[task_id] = {
        "status": "processing",
        "progress": 0,
        "result": None
    }
    
    # Add background task
    background_tasks.add_task(
        process_conversion_async, 
        task_id, 
        file, 
        voice, 
        wait_time
    )
    
    return {"task_id": task_id, "message": "Processing started"}

async def process_conversion_async(task_id: str, file: UploadFile, voice: str, wait_time: int):
    """Background task for processing conversion"""
    try:
        # Update status
        conversion_tasks[task_id]["progress"] = 10
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        upload_filename = f"{unique_id}{file_extension}"
        upload_path = UPLOAD_DIR / upload_filename
        
        # Save uploaded file
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        conversion_tasks[task_id]["progress"] = 30
        
        # Generate output filename
        output_filename = f"{unique_id}.mp3"
        output_path = OUTPUT_DIR / output_filename
        
        # Get VTS instance
        vts = get_vts_instance()
        vts.set_voice(voice)
        
        conversion_tasks[task_id]["progress"] = 50
        
        # Perform conversion
        result = vts.convert(
            image_path=str(upload_path),
            output_wav_path=str(output_path),
            wait_time=wait_time
        )
        
        conversion_tasks[task_id]["progress"] = 90
        
        # Clean up uploaded file
        try:
            os.remove(upload_path)
        except:
            pass
        
        if result["success"]:
            conversion_tasks[task_id].update({
                "status": "completed",
                "progress": 100,
                "result": ConversionResponse(
                    success=True,
                    message="Conversion completed successfully!",
                    text_result=result["text_result"],
                    audio_url=f"/outputs/{output_filename}",
                    audio_filename=output_filename,
                    voice_used=result["voice_used"]
                )
            })
        else:
            # Clean up output file if exists
            try:
                if os.path.exists(output_path):
                    os.remove(output_path)
            except:
                pass
            
            conversion_tasks[task_id].update({
                "status": "failed",
                "progress": 100,
                "result": ConversionResponse(
                    success=False,
                    message="Conversion failed",
                    error=result["error"]
                )
            })
    
    except Exception as e:
        conversion_tasks[task_id].update({
            "status": "failed",
            "progress": 100,
            "result": ConversionResponse(
                success=False,
                message="Processing error",
                error=str(e)
            )
        })

@app.get("/status/{task_id}")
async def get_conversion_status(task_id: str):
    """Get conversion status by task ID"""
    if task_id not in conversion_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_data = conversion_tasks[task_id]
    return ConversionStatus(
        task_id=task_id,
        status=task_data["status"],
        progress=task_data["progress"],
        result=task_data["result"]
    )

@app.get("/voices")
async def get_available_voices():
    """Get list of available TTS voices"""
    return {
        "voices": [
            {"code": "banmai", "name": "Ban Mai (Nam miền Bắc)", "gender": "male"},
            {"code": "lannhi", "name": "Lan Nhi (Nữ miền Bắc)", "gender": "female"},
            {"code": "myan", "name": "My An (Nữ miền Nam)", "gender": "female"},
            {"code": "giahuy", "name": "Gia Huy (Nam trẻ)", "gender": "male"},
            {"code": "minhquang", "name": "Minh Quang (Nam miền Nam)", "gender": "male"}
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test VTS instance creation
        vts = get_vts_instance()
        return {
            "status": "healthy",
            "message": "VisionAid API is running",
            "voice": vts.voice
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": str(e)
        }

# Cleanup old files periodically
@app.on_event("startup")
async def startup_event():
    """Clean up old files on startup"""
    cleanup_old_files()

def cleanup_old_files():
    """Remove files older than 1 hour"""
    import time
    current_time = time.time()
    
    for directory in [UPLOAD_DIR, OUTPUT_DIR]:
        for file_path in directory.glob("*"):
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > 3600:  # 1 hour
                    try:
                        file_path.unlink()
                    except:
                        pass

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

from fastapi.responses import JSONResponse

@app.post("/upload_base64")
async def upload_base64(request: Request):
    try:
        data = await request.json()
        print("📩 Received keys:", data.keys())

        if "image" not in data:
            print("❌ Missing key 'image'")
            return JSONResponse(content={"error": "Missing 'image' field in request body"}, status_code=400)

        image_base64 = data["image"]
        img_bytes = base64.b64decode(image_base64)

        unique_id = str(uuid.uuid4())
        upload_path = UPLOAD_DIR / f"{unique_id}.jpg"
        output_path = OUTPUT_DIR / f"{unique_id}.mp3"

        with open(upload_path, "wb") as f:
            f.write(img_bytes)

        vts = get_vts_instance()
        result = vts.convert(str(upload_path), str(output_path))

        os.remove(upload_path)

        if result["success"]:
            resp = {
                "success": True,
                "text_result": result["text_result"],
                "audio_url": f"http://192.168.1.13:7000/outputs/{unique_id}.mp3",
            }
        else:
            resp = {"success": False, "error": result["error"]}

        print("✅ Sending response:", resp)
        return JSONResponse(content=resp)

    except Exception as e:
        print("🔥 ERROR OCCURRED 🔥")
        traceback.print_exc()
        return JSONResponse(content={"success": False, "error": str(e)}, status_code=500)

