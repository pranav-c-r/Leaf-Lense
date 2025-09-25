from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from typing import List, Dict, Optional
import asyncio
import httpx
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pathlib import Path
import math
import random
import logging
from concurrent.futures import ThreadPoolExecutor
import time

# Load environment variables from backend root directory
backend_root = Path(__file__).parent.parent
load_dotenv(backend_root / '.env')

# Import the comprehensive scraper
try:
    from .comprehensive_scraper import create_scraper
    SCRAPER_AVAILABLE = True
except ImportError as e:
    SCRAPER_AVAILABLE = False
    logging.warning(f"Comprehensive scraper not available: {e}")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global scraper instance
scraper_instance = None
if SCRAPER_AVAILABLE:
    try:
        scraper_instance = create_scraper()
    except Exception as e:
        logger.error(f"Failed to initialize scraper: {e}")
        scraper_instance = None

# Cache for storing scraped data
data_cache = {}
cache_expiry = {}

def is_cache_valid(key: str, expiry_minutes: int = 30) -> bool:
    """Check if cached data is still valid"""
    if key not in cache_expiry:
        return False
    return datetime.now() < cache_expiry[key] + timedelta(minutes=expiry_minutes)

def set_cache(key: str, data: any, expiry_minutes: int = 30):
    """Set data in cache with expiry"""
    data_cache[key] = data
    cache_expiry[key] = datetime.now()

def get_cached_data(key: str):
    """Get cached data if valid"""
    if is_cache_valid(key):
        return data_cache[key]
    return None

# Enhanced price data generator with more realistic prices
def generate_enhanced_mock_price_data(vegetable: str, market: str, state: str):
    """Generate realistic mock price data for vegetables"""
    # Base prices for different vegetables (per kg in rupees)
    base_prices = {
        "Onion": 30, "Potato": 25, "Tomato": 40, "Cabbage": 20, "Cauliflower": 35,
        "Carrot": 45, "Beans": 60, "Brinjal": 35, "Capsicum": 80, "Green Chilli": 120,
        "Garlic": 150, "Ginger": 200, "Coriander": 20, "Spinach": 15, "Bottle Gourd": 25,
        "Ridge Gourd": 30, "Bitter Gourd": 50, "Lady Finger": 40, "Cucumber": 20, "Pumpkin": 15
    }
    
    base_price = base_prices.get(vegetable, 30)
    
    # Add some randomization (±30%)
    variation = random.uniform(0.7, 1.3)
    min_price = round(base_price * variation * 0.8, 2)
    max_price = round(base_price * variation * 1.2, 2)
    modal_price = round(base_price * variation, 2)
    
    today = datetime.now().strftime('%d-%b-%Y')
    
    return [{
        "S.No": "1",
        "City": market,
        "Commodity": vegetable,
        "Min Prize": str(min_price),
        "Max Prize": str(max_price),
        "Model Prize": str(modal_price),
        "Date": today
    }]

router = APIRouter(prefix="/mandi", tags=["Mandi Prices"])

# Common Indian vegetables and their AgMarkNet names
COMMON_VEGETABLES = [
    "Onion", "Potato", "Tomato", "Cabbage", "Cauliflower", 
    "Carrot", "Beans", "Brinjal", "Capsicum", "Green Chilli",
    "Garlic", "Ginger", "Coriander", "Spinach", "Bottle Gourd",
    "Ridge Gourd", "Bitter Gourd", "Lady Finger", "Cucumber", "Pumpkin"
]

# Kerala-focused mandi data with accurate coordinates
MANDI_LOCATIONS = {
    "Kerala": [
        {"name": "Kottayam", "lat": 9.5915, "lon": 76.5222},
        {"name": "Ernakulam", "lat": 9.9312, "lon": 76.2673},
        {"name": "Thrissur", "lat": 10.5276, "lon": 76.2144},
        {"name": "Palakkad", "lat": 10.7867, "lon": 76.6548},
        {"name": "Kozhikode", "lat": 11.2588, "lon": 75.7804},
        {"name": "Alappuzha", "lat": 9.4981, "lon": 76.3388},
        {"name": "Kollam", "lat": 8.8932, "lon": 76.6141},
        {"name": "Thiruvananthapuram", "lat": 8.5241, "lon": 76.9366},
        {"name": "Kannur", "lat": 11.8745, "lon": 75.3704},
        {"name": "Kasaragod", "lat": 12.4996, "lon": 74.9869},
        {"name": "Wayanad", "lat": 11.6054, "lon": 76.0867},
        {"name": "Idukki", "lat": 9.8560, "lon": 76.9706},
        {"name": "Pathanamthitta", "lat": 9.2648, "lon": 76.7871},
        {"name": "Malappuram", "lat": 11.0688, "lon": 76.0759}
    ],
    "Tamil Nadu": [
        {"name": "Coimbatore", "lat": 11.0168, "lon": 76.9558},
        {"name": "Madurai", "lat": 9.9252, "lon": 78.1198},
        {"name": "Salem", "lat": 11.6643, "lon": 78.1460},
        {"name": "Trichy", "lat": 10.7905, "lon": 78.7047},
        {"name": "Chennai", "lat": 13.0827, "lon": 80.2707}
    ],
    "Karnataka": [
        {"name": "Mangalore", "lat": 12.9141, "lon": 74.8560},
        {"name": "Mysore", "lat": 12.2958, "lon": 76.6394},
        {"name": "Bangalore", "lat": 12.9716, "lon": 77.5946},
        {"name": "Hubli", "lat": 15.3647, "lon": 75.1240},
        {"name": "Belgaum", "lat": 15.8497, "lon": 74.4977}
    ]
}

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance

@router.get("/")
async def mandi_root():
    """Root endpoint for mandi service"""
    return {
        "service": "Mandi Price Service",
        "version": "1.0.0",
        "status": "active",
        "features": ["nearest_mandis", "price_data", "vegetable_prices"]
    }

@router.get("/nearest-mandis")
async def get_nearest_mandis(
    lat: float = Query(..., description="User's latitude"),
    lon: float = Query(..., description="User's longitude"),
    limit: int = Query(default=5, description="Number of nearest mandis to return")
):
    """Find nearest mandis based on user's location"""
    try:
        nearest_mandis = []
        
        # Calculate distance to all mandis
        for state, mandis in MANDI_LOCATIONS.items():
            for mandi in mandis:
                distance = calculate_distance(lat, lon, mandi["lat"], mandi["lon"])
                nearest_mandis.append({
                    "name": mandi["name"],
                    "state": state,
                    "lat": mandi["lat"],
                    "lon": mandi["lon"],
                    "distance_km": round(distance, 2)
                })
        
        # Sort by distance and return top results
        nearest_mandis.sort(key=lambda x: x["distance_km"])
        
        return {
            "status": "success",
            "user_location": {"lat": lat, "lon": lon},
            "nearest_mandis": nearest_mandis[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding nearest mandis: {str(e)}")

@router.get("/vegetable-prices/{state}/{market}")
async def get_vegetable_prices(
    state: str,
    market: str,
    vegetables: Optional[List[str]] = Query(default=None, description="Specific vegetables to fetch prices for")
):
    """Get prices for multiple vegetables in a specific mandi"""
    try:
        if not vegetables:
            vegetables = COMMON_VEGETABLES[:10]  # Default to first 10 common vegetables
        
        price_data = []
        errors = []
        
        for vegetable in vegetables:
            try:
                # Generate enhanced mock price data
                result = generate_enhanced_mock_price_data(vegetable, market, state)
                if result:
                    price_data.extend(result)
                else:
                    errors.append(f"No data found for {vegetable}")
            except Exception as e:
                errors.append(f"Error fetching {vegetable}: {str(e)}")
                continue
        
        return {
            "status": "success",
            "state": state,
            "market": market,
            "vegetables_requested": vegetables,
            "price_data": price_data,
            "errors": errors if errors else None,
            "total_records": len(price_data),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vegetable prices: {str(e)}")

@router.get("/single-price")
async def get_single_vegetable_price(
    commodity: str = Query(..., description="Vegetable/commodity name"),
    state: str = Query(..., description="State name"),
    market: str = Query(..., description="Market/city name")
):
    """Get price for a single vegetable (wrapper around existing API)"""
    try:
        result = generate_enhanced_mock_price_data(commodity, market, state)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"No price data found for {commodity} in {market}, {state}")
        
        return {
            "status": "success",
            "commodity": commodity,
            "state": state,
            "market": market,
            "price_data": result,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching price data: {str(e)}")

@router.get("/states")
async def get_available_states():
    """Get list of available states"""
    return {
        "status": "success",
        "states": list(MANDI_LOCATIONS.keys()),
        "total_states": len(MANDI_LOCATIONS)
    }

@router.get("/markets/{state}")
async def get_markets_by_state(state: str):
    """Get list of markets for a specific state"""
    if state not in MANDI_LOCATIONS:
        raise HTTPException(status_code=404, detail=f"State '{state}' not found")
    
    markets = [mandi["name"] for mandi in MANDI_LOCATIONS[state]]
    
    return {
        "status": "success",
        "state": state,
        "markets": markets,
        "total_markets": len(markets)
    }

@router.get("/vegetables")
async def get_common_vegetables():
    """Get list of commonly traded vegetables"""
    return {
        "status": "success",
        "vegetables": COMMON_VEGETABLES,
        "total_vegetables": len(COMMON_VEGETABLES)
    }

@router.get("/reverse-geocode")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """Get place name from coordinates using OpenStreetMap Nominatim API"""
    try:
        async with httpx.AsyncClient() as client:
            # Use OpenStreetMap Nominatim API for reverse geocoding
            url = f"https://nominatim.openstreetmap.org/reverse"
            params = {
                "format": "json",
                "lat": lat,
                "lon": lon,
                "zoom": 10,
                "addressdetails": 1
            }
            headers = {
                "User-Agent": "LeafLense-MandiPrices/1.0"
            }
            
            response = await client.get(url, params=params, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
                address = data.get("address", {})
                display_name = data.get("display_name", "Unknown Location")
                
                # Extract meaningful location info
                location_info = {
                    "display_name": display_name,
                    "city": address.get("city") or address.get("town") or address.get("village"),
                    "district": address.get("state_district") or address.get("county"),
                    "state": address.get("state"),
                    "country": address.get("country"),
                    "postcode": address.get("postcode")
                }
                
                # Create a short, readable location string
                parts = []
                if location_info["city"]:
                    parts.append(location_info["city"])
                if location_info["district"] and location_info["district"] != location_info["city"]:
                    parts.append(location_info["district"])
                if location_info["state"]:
                    parts.append(location_info["state"])
                
                short_name = ", ".join(parts) if parts else "Unknown Location"
                
                return {
                    "status": "success",
                    "location": {
                        "lat": lat,
                        "lon": lon,
                        "short_name": short_name,
                        "full_address": display_name,
                        "details": location_info
                    }
                }
            else:
                return {
                    "status": "error",
                    "location": {
                        "lat": lat,
                        "lon": lon,
                        "short_name": f"Location ({lat:.4f}, {lon:.4f})",
                        "full_address": "Address lookup failed",
                        "details": {}
                    }
                }
                
    except Exception as e:
        return {
            "status": "error",
            "location": {
                "lat": lat,
                "lon": lon,
                "short_name": f"Location ({lat:.4f}, {lon:.4f})",
                "full_address": "Address lookup failed",
                "details": {}
            },
            "error": str(e)
        }

@router.post("/bulk-prices")
async def get_bulk_prices(
    request_data: Dict = {
        "user_location": {"lat": 12.9716, "lon": 77.5946},
        "vegetables": ["Onion", "Potato", "Tomato"],
        "max_mandis": 3
    }
):
    """Get prices for multiple vegetables from nearest mandis"""
    try:
        user_lat = request_data.get("user_location", {}).get("lat")
        user_lon = request_data.get("user_location", {}).get("lon")
        vegetables = request_data.get("vegetables", COMMON_VEGETABLES[:5])
        max_mandis = request_data.get("max_mandis", 3)
        
        if not user_lat or not user_lon:
            raise HTTPException(status_code=400, detail="User location (lat, lon) is required")
        
        # Get nearest mandis
        nearest_mandis_response = await get_nearest_mandis(user_lat, user_lon, max_mandis)
        nearest_mandis = nearest_mandis_response["nearest_mandis"]
        
        bulk_data = []
        
        for mandi in nearest_mandis:
            mandi_data = {
                "mandi": mandi,
                "vegetables": [],
                "errors": []
            }
            
            for vegetable in vegetables:
                try:
                    result = generate_enhanced_mock_price_data(vegetable, mandi["name"], mandi["state"])
                    if result:
                        mandi_data["vegetables"].extend(result)
                    else:
                        mandi_data["errors"].append(f"No data for {vegetable}")
                except Exception as e:
                    mandi_data["errors"].append(f"Error fetching {vegetable}: {str(e)}")
            
            bulk_data.append(mandi_data)
        
        return {
            "status": "success",
            "user_location": {"lat": user_lat, "lon": user_lon},
            "bulk_price_data": bulk_data,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching bulk prices: {str(e)}")

# Real-time scraping endpoints
@router.get("/realtime-price")
async def get_realtime_price(
    commodity: str = Query(..., description="Commodity/vegetable name"),
    state: str = Query(..., description="State name"),
    market: str = Query(None, description="Market name (optional)")
):
    """Get real-time price data by scraping Agmarknet"""
    try:
        # Check cache first
        cache_key = f"realtime_{commodity}_{state}_{market}"
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            logger.info(f"Returning cached data for {cache_key}")
            return {
                "status": "success",
                "data_source": "cache",
                "commodity": commodity,
                "state": state,
                "market": market,
                "price_data": cached_data["price_data"],
                "timestamp": cached_data["timestamp"],
                "cache_time": datetime.now().isoformat()
            }
        
        # If scraper is available, use it
        if SCRAPER_AVAILABLE and scraper_instance:
            try:
                logger.info(f"Scraping real-time data for {commodity} in {state} - {market}")
                scraped_data = scraper_instance.get_realtime_price_data(state, commodity, market)
                
                if scraped_data:
                    cleaned_data = scraper_instance.cleanup_price_data(scraped_data)
                    
                    # Cache the result
                    cache_data = {
                        "price_data": cleaned_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    set_cache(cache_key, cache_data, expiry_minutes=30)
                    
                    return {
                        "status": "success",
                        "data_source": "realtime_scrape",
                        "commodity": commodity,
                        "state": state,
                        "market": market,
                        "price_data": cleaned_data,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    logger.warning(f"No scraped data found for {commodity} in {state}")
                    
            except Exception as e:
                logger.error(f"Error scraping data: {e}")
        
        # Fallback to enhanced mock data
        logger.info(f"Using enhanced mock data for {commodity} in {state}")
        mock_data = generate_enhanced_mock_price_data(commodity, market or "Unknown", state)
        
        return {
            "status": "success",
            "data_source": "enhanced_mock",
            "commodity": commodity,
            "state": state,
            "market": market,
            "price_data": mock_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching real-time price: {str(e)}")

@router.get("/kerala-comprehensive")
async def get_kerala_comprehensive_data(
    commodities: Optional[List[str]] = Query(default=None, description="List of commodities to fetch")
):
    """Get comprehensive data for all Kerala mandis"""
    try:
        # Check cache first
        cache_key = f"kerala_comprehensive_{','.join(commodities or [])}"
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            logger.info("Returning cached Kerala comprehensive data")
            return {
                "status": "success",
                "data_source": "cache",
                "state": "Kerala",
                "data": cached_data["data"],
                "timestamp": cached_data["timestamp"],
                "cache_time": datetime.now().isoformat()
            }
        
        # If scraper is available, use it
        if SCRAPER_AVAILABLE and scraper_instance:
            try:
                logger.info("Scraping comprehensive Kerala data")
                kerala_data = scraper_instance.get_comprehensive_kerala_data(commodities)
                
                if kerala_data:
                    # Cache the result
                    cache_data = {
                        "data": kerala_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    set_cache(cache_key, cache_data, expiry_minutes=45)
                    
                    return {
                        "status": "success",
                        "data_source": "realtime_scrape",
                        "state": "Kerala",
                        "data": kerala_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    
            except Exception as e:
                logger.error(f"Error scraping Kerala data: {e}")
        
        # Fallback to enhanced mock data for Kerala
        logger.info("Using enhanced mock data for Kerala")
        kerala_mandis = [mandi["name"] for mandi in MANDI_LOCATIONS["Kerala"][:5]]
        default_commodities = commodities or ["Onion", "Tomato", "Rice", "Coconut", "Pepper"]
        
        mock_kerala_data = {}
        for mandi in kerala_mandis:
            mock_kerala_data[mandi] = {}
            for commodity in default_commodities:
                mock_kerala_data[mandi][commodity] = generate_enhanced_mock_price_data(commodity, mandi, "Kerala")
        
        return {
            "status": "success",
            "data_source": "enhanced_mock",
            "state": "Kerala",
            "data": mock_kerala_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching Kerala comprehensive data: {str(e)}")

@router.get("/available-markets/{state}")
async def get_available_markets_realtime(state: str):
    """Get available markets for a state using real-time scraping"""
    try:
        # Check cache first
        cache_key = f"markets_{state}"
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            return {
                "status": "success",
                "data_source": "cache",
                "state": state,
                "markets": cached_data["markets"],
                "timestamp": cached_data["timestamp"]
            }
        
        # If scraper is available, use it
        if SCRAPER_AVAILABLE and scraper_instance:
            try:
                logger.info(f"Scraping available markets for {state}")
                markets = scraper_instance.get_available_markets_for_state(state)
                
                if markets:
                    # Cache the result
                    cache_data = {
                        "markets": markets,
                        "timestamp": datetime.now().isoformat()
                    }
                    set_cache(cache_key, cache_data, expiry_minutes=120)  # Markets don't change often
                    
                    return {
                        "status": "success",
                        "data_source": "realtime_scrape",
                        "state": state,
                        "markets": markets,
                        "timestamp": datetime.now().isoformat()
                    }
                    
            except Exception as e:
                logger.error(f"Error scraping markets for {state}: {e}")
        
        # Fallback to predefined data
        if state in MANDI_LOCATIONS:
            markets = [mandi["name"] for mandi in MANDI_LOCATIONS[state]]
            return {
                "status": "success",
                "data_source": "predefined",
                "state": state,
                "markets": markets,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=404, detail=f"No markets found for state: {state}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching markets: {str(e)}")

@router.post("/scrape-multiple-commodities")
async def scrape_multiple_commodities(
    request_data: Dict = {
        "state": "Kerala",
        "commodities": ["Onion", "Tomato", "Rice"],
        "market": None
    }
):
    """Scrape multiple commodities for a state/market in parallel"""
    try:
        state = request_data.get("state")
        commodities = request_data.get("commodities", [])
        market = request_data.get("market")
        
        if not state or not commodities:
            raise HTTPException(status_code=400, detail="State and commodities are required")
        
        # Check cache first
        cache_key = f"multi_{state}_{market}_{','.join(commodities)}"
        cached_data = get_cached_data(cache_key)
        
        if cached_data:
            return {
                "status": "success",
                "data_source": "cache",
                "state": state,
                "market": market,
                "commodities": commodities,
                "data": cached_data["data"],
                "timestamp": cached_data["timestamp"]
            }
        
        # If scraper is available, use it
        if SCRAPER_AVAILABLE and scraper_instance:
            try:
                logger.info(f"Scraping multiple commodities for {state} - {market}")
                scraped_data = scraper_instance.scrape_multiple_commodities_parallel(
                    state=state,
                    commodities=commodities,
                    market=market,
                    max_workers=3
                )
                
                if scraped_data:
                    # Clean the data
                    cleaned_data = {}
                    for commodity, data in scraped_data.items():
                        cleaned_data[commodity] = scraper_instance.cleanup_price_data(data)
                    
                    # Cache the result
                    cache_data = {
                        "data": cleaned_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    set_cache(cache_key, cache_data, expiry_minutes=30)
                    
                    return {
                        "status": "success",
                        "data_source": "realtime_scrape",
                        "state": state,
                        "market": market,
                        "commodities": commodities,
                        "data": cleaned_data,
                        "timestamp": datetime.now().isoformat()
                    }
                    
            except Exception as e:
                logger.error(f"Error scraping multiple commodities: {e}")
        
        # Fallback to enhanced mock data
        logger.info(f"Using enhanced mock data for multiple commodities in {state}")
        mock_data = {}
        for commodity in commodities:
            mock_data[commodity] = generate_enhanced_mock_price_data(commodity, market or "Unknown", state)
        
        return {
            "status": "success",
            "data_source": "enhanced_mock",
            "state": state,
            "market": market,
            "commodities": commodities,
            "data": mock_data,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error scraping multiple commodities: {str(e)}")

@router.get("/scraper-status")
async def get_scraper_status():
    """Get status of the scraper and cache"""
    return {
        "status": "success",
        "scraper_available": SCRAPER_AVAILABLE,
        "scraper_instance_active": scraper_instance is not None,
        "cache_entries": len(data_cache),
        "cache_keys": list(data_cache.keys())[:10],  # Show first 10 cache keys
        "timestamp": datetime.now().isoformat()
    }
