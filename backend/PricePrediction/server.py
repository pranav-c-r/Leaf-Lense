#!/usr/bin/env python3
"""
LeafLense Price Prediction Server
FastAPI server that serves the trained crop price prediction model
"""

import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Add current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import the price prediction routes
from routes import router as price_router

# Initialize FastAPI app
app = FastAPI(
    title="LeafLense Price Prediction Service",
    description="AI-powered crop price prediction service using machine learning",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React development server
        "http://localhost:5173",  # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",  # Self
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the price prediction routes
app.include_router(price_router, prefix="/price", tags=["Price Prediction"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "LeafLense Price Prediction API",
        "version": "1.0.0",
        "status": "active",
        "description": "AI-powered crop price prediction service",
        "endpoints": {
            "price_prediction": "/price/predict",
            "commodities": "/price/commodities", 
            "states": "/price/states",
            "health": "/health",
            "docs": "/docs"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "LeafLense Price Prediction API",
        "timestamp": os.popen('date').read().strip(),
        "model_status": "loaded" if hasattr(app.state, 'model_loaded') else "unknown"
    }

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for better error responses"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "status": "error"
        }
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    print("🚀 Starting LeafLense Price Prediction Service...")
    print(f"📁 Working directory: {current_dir}")
    
    # Check if model file exists
    model_path = os.path.join(current_dir, "crop_price_model.pkl")
    if os.path.exists(model_path):
        print(f"✅ Model file found: {model_path}")
        app.state.model_loaded = True
    else:
        print(f"⚠️  Model file not found: {model_path}")
        app.state.model_loaded = False
    
    print("🎯 API Documentation available at: http://localhost:8000/docs")
    print("🌐 Service ready to accept requests")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("🛑 Shutting down LeafLense Price Prediction Service...")

if __name__ == "__main__":
    print("🌿 LeafLense Price Prediction Server")
    print("=" * 50)
    
    # Configuration
    host = "0.0.0.0"
    port = 8000
    
    print(f"🚀 Starting server on {host}:{port}")
    print(f"📖 API Documentation: http://localhost:{port}/docs")
    print(f"🔗 Frontend should connect to: http://localhost:{port}")
    print("=" * 50)
    
    # Run the server
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload for development
        log_level="info",
        access_log=True
    )
