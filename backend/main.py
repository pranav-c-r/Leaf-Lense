from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Load environment variables (from .env inside backend/)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

# Debug print (remove later if not needed)
print(f"DEBUG: PRIVATE_KEY starts with: {str(os.getenv('PRIVATE_KEY'))[:25]}...")

# Import routers
from FarmAgent.routes import router as farm_router
from Plant_Disease.routes import router as plant_router
from FertilizerSuggestor.routes import router as fert_router
from Yield_Prediction.routes import router as yield_router
from markLense.routes import router as mandi_router
from marketplace.routes import router as marketplace_router
from crop_recommendations.routes import router as recommendations_router
from PricePrediction.routes import router as price_router
from AIChat.routes import router as ai_router

# Create FastAPI app
app = FastAPI(
    title="Unified Backend",
    description="Single backend server for FarmAgent, Plant_Disease and other services",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # ⚠️ Replace with frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(farm_router, prefix="", tags=["FarmAgent"])
app.include_router(plant_router, prefix="/plant", tags=["Plant_Disease"])
app.include_router(fert_router, prefix="/fertilizer", tags=["FertilizerSuggestor"])
app.include_router(yield_router, prefix="/yield", tags=["YieldPredictor"])
app.include_router(mandi_router, prefix="", tags=["Mandi"])
app.include_router(marketplace_router, prefix="", tags=["Marketplace"])
app.include_router(recommendations_router, prefix="", tags=["CropRecommendations"])
app.include_router(price_router, prefix="/price", tags=["PricePrediction"])
app.include_router(ai_router, prefix="", tags=["AIChat"])

@app.get("/")
def root():
    return {"message": "Unified Backend running successfully"}

# Optional: If you want to run initialization code (e.g. loading global models),
# use FastAPI startup event handlers inside each router module or here
@app.on_event("startup")
def startup_event():
    print("Application startup: initialize resources if needed")

# Only for local development
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",   # ✅ correct since Render root is backend/
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=not os.getenv("RENDER")  # ✅ reload locally, disabled on Render
    )
