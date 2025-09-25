from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import datetime
import json
from firebase_admin import firestore
import firebase_admin
from firebase_admin import credentials
import os
import uuid

router = APIRouter()

# Initialize Firebase Admin SDK if not already done
try:
    # Check if Firebase app is already initialized
    firebase_admin.get_app()
except ValueError:
    # Initialize Firebase app
    service_account_path = os.path.join(os.path.dirname(__file__), "../serviceAccountKey.json")
    if os.path.exists(service_account_path):
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)

db = firestore.client()

class CropListing(BaseModel):
    cropName: str
    variety: str
    quantity: float
    pricePerKg: float
    harvestDate: str
    description: str
    location: str
    contactNumber: str
    farmerId: str
    farmerName: str
    farmerPhone: str
    farmerLocation: str
    status: str = "active"

class InterestRequest(BaseModel):
    listingId: str
    buyerId: str
    message: Optional[str] = ""

class MarketplaceFilters(BaseModel):
    cropName: Optional[str] = None
    location: Optional[str] = None
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None
    searchTerm: Optional[str] = None

@router.post("/api/marketplace/listings")
async def create_listing(listing: CropListing):
    """Create a new crop listing"""
    try:
        listing_data = listing.dict()
        listing_data['id'] = str(uuid.uuid4())
        listing_data['createdAt'] = datetime.datetime.now()
        listing_data['views'] = 0
        listing_data['interested'] = []
        
        # Add to Firestore
        doc_ref = db.collection('cropListings').document(listing_data['id'])
        doc_ref.set(listing_data)
        
        return {"success": True, "listingId": listing_data['id'], "message": "Listing created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating listing: {str(e)}")

@router.get("/api/marketplace/listings")
async def get_listings(
    cropName: Optional[str] = None,
    location: Optional[str] = None,
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    searchTerm: Optional[str] = None
):
    """Get crop listings with optional filters"""
    try:
        # Start with base query
        query = db.collection('cropListings').where('status', '==', 'active')
        
        # Apply filters
        if cropName:
            query = query.where('cropName', '==', cropName)
        if location:
            query = query.where('farmerLocation', '==', location)
            
        # Execute query
        docs = query.stream()
        
        listings = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            
            # Apply price and search filters (Firestore doesn't support range queries with other filters)
            if minPrice and data.get('pricePerKg', 0) < minPrice:
                continue
            if maxPrice and data.get('pricePerKg', float('inf')) > maxPrice:
                continue
            if searchTerm:
                search_text = f"{data.get('cropName', '')} {data.get('variety', '')} {data.get('description', '')}".lower()
                if searchTerm.lower() not in search_text:
                    continue
                    
            listings.append(data)
        
        # Sort by creation date (newest first)
        listings.sort(key=lambda x: x.get('createdAt', datetime.datetime.min), reverse=True)
        
        return {"listings": listings, "count": len(listings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching listings: {str(e)}")

@router.get("/api/marketplace/listings/{listing_id}")
async def get_listing(listing_id: str):
    """Get a specific crop listing by ID"""
    try:
        doc_ref = db.collection('cropListings').document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        data = doc.to_dict()
        data['id'] = doc.id
        
        # Increment view count
        doc_ref.update({'views': data.get('views', 0) + 1})
        data['views'] = data.get('views', 0) + 1
        
        return data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error fetching listing: {str(e)}")

@router.post("/api/marketplace/listings/{listing_id}/interest")
async def show_interest(listing_id: str, interest: InterestRequest):
    """Register interest in a crop listing"""
    try:
        doc_ref = db.collection('cropListings').document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        data = doc.to_dict()
        interested = data.get('interested', [])
        
        # Check if user already showed interest
        if interest.buyerId in interested:
            return {"success": False, "message": "You have already shown interest in this listing"}
            
        # Add buyer to interested list
        interested.append(interest.buyerId)
        doc_ref.update({
            'interested': interested,
            'views': data.get('views', 0) + 1
        })
        
        # TODO: Send notification to farmer
        
        return {"success": True, "message": "Interest registered successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error registering interest: {str(e)}")

@router.get("/api/marketplace/listings/farmer/{farmer_id}")
async def get_farmer_listings(farmer_id: str):
    """Get all listings by a specific farmer"""
    try:
        query = db.collection('cropListings').where('farmerId', '==', farmer_id)
        docs = query.stream()
        
        listings = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            listings.append(data)
        
        # Sort by creation date (newest first)
        listings.sort(key=lambda x: x.get('createdAt', datetime.datetime.min), reverse=True)
        
        return {"listings": listings, "count": len(listings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching farmer listings: {str(e)}")

@router.put("/api/marketplace/listings/{listing_id}/status")
async def update_listing_status(listing_id: str, status: str):
    """Update listing status (active, sold, expired)"""
    try:
        if status not in ['active', 'sold', 'expired']:
            raise HTTPException(status_code=400, detail="Invalid status")
            
        doc_ref = db.collection('cropListings').document(listing_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Listing not found")
            
        doc_ref.update({'status': status, 'updatedAt': datetime.datetime.now()})
        
        return {"success": True, "message": f"Listing status updated to {status}"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error updating listing status: {str(e)}")

@router.get("/api/marketplace/stats")
async def get_marketplace_stats():
    """Get marketplace statistics"""
    try:
        # Get active listings count
        active_query = db.collection('cropListings').where('status', '==', 'active')
        active_listings = len(list(active_query.stream()))
        
        # Get total farmers
        farmers_query = db.collection('cropListings').where('status', '==', 'active')
        farmer_ids = set()
        for doc in farmers_query.stream():
            farmer_ids.add(doc.to_dict().get('farmerId'))
        total_farmers = len(farmer_ids)
        
        # Mock some additional stats
        stats = {
            "activeListings": active_listings,
            "totalFarmers": total_farmers,
            "totalTransactions": 156,  # This would be from a transactions collection
            "averagePrice": 28.5,      # This would be calculated from actual data
            "topCrops": [
                {"name": "Rice", "count": 45},
                {"name": "Wheat", "count": 32},
                {"name": "Cotton", "count": 28},
                {"name": "Tomato", "count": 24},
                {"name": "Sugarcane", "count": 18}
            ]
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching marketplace stats: {str(e)}")
