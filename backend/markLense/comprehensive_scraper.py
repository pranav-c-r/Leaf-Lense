import asyncio
import aiohttp
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup
import logging
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from concurrent.futures import ThreadPoolExecutor
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgmarknetScraper:
    """Comprehensive Agmarknet scraper that can fetch data from all states and mandis"""
    
    def __init__(self):
        self.base_url = "https://agmarknet.gov.in/SearchCmmMkt.aspx"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
        # Comprehensive list of all Indian states and major commodities
        self.states_list = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
            "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
            "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry"
        ]
        
        self.common_commodities = [
            "Onion", "Potato", "Tomato", "Rice", "Wheat", "Maize", "Bajra", "Jowar",
            "Cabbage", "Cauliflower", "Carrot", "Beans", "Brinjal", "Capsicum",
            "Green Chilli", "Garlic", "Ginger", "Coriander", "Spinach", "Bottle Gourd",
            "Ridge Gourd", "Bitter Gourd", "Lady Finger", "Cucumber", "Pumpkin",
            "Groundnut", "Mustard Seed", "Sesame", "Sunflower", "Coconut",
            "Turmeric", "Red Chilli", "Coriander Seed", "Cumin", "Fenugreek"
        ]
        
        # Kerala specific mandi locations with coordinates
        self.kerala_mandis = {
            "Kottayam": {"lat": 9.5915, "lon": 76.5222},
            "Ernakulam": {"lat": 9.9312, "lon": 76.2673},
            "Thrissur": {"lat": 10.5276, "lon": 76.2144},
            "Palakkad": {"lat": 10.7867, "lon": 76.6548},
            "Kozhikode": {"lat": 11.2588, "lon": 75.7804},
            "Alappuzha": {"lat": 9.4981, "lon": 76.3388},
            "Kollam": {"lat": 8.8932, "lon": 76.6141},
            "Thiruvananthapuram": {"lat": 8.5241, "lon": 76.9366},
            "Kannur": {"lat": 11.8745, "lon": 75.3704},
            "Kasaragod": {"lat": 12.4996, "lon": 74.9869},
            "Wayanad": {"lat": 11.6054, "lon": 76.0867},
            "Idukki": {"lat": 9.8560, "lon": 76.9706},
            "Pathanamthitta": {"lat": 9.2648, "lon": 76.7871},
            "Malappuram": {"lat": 11.0688, "lon": 76.0759}
        }
    
    def setup_selenium_driver(self, headless=True):
        """Setup Selenium WebDriver with Chrome options"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        try:
            driver = webdriver.Chrome(options=chrome_options)
            return driver
        except Exception as e:
            logger.error(f"Failed to setup Chrome driver: {e}")
            return None
    
    def scrape_single_commodity_data(self, state: str, commodity: str, market: str = None, days_back: int = 0) -> List[Dict]:
        """Scrape data for a single commodity from specific state and market"""
        driver = self.setup_selenium_driver()
        if not driver:
            return []
        
        try:
            driver.get(self.base_url)
            wait = WebDriverWait(driver, 10)
            
            # Select commodity
            commodity_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlCommodity')))
            commodity_select = Select(commodity_dropdown)
            
            try:
                commodity_select.select_by_visible_text(commodity)
            except Exception as e:
                logger.warning(f"Commodity '{commodity}' not found, trying alternatives...")
                # Try partial match
                for option in commodity_select.options:
                    if commodity.lower() in option.text.lower():
                        commodity_select.select_by_visible_text(option.text)
                        break
                else:
                    logger.error(f"No suitable commodity found for '{commodity}'")
                    return []
            
            # Select state
            state_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlState')))
            state_select = Select(state_dropdown)
            
            try:
                state_select.select_by_visible_text(state)
            except Exception as e:
                logger.error(f"State '{state}' not found: {e}")
                return []
            
            # Set date (default to today or days back)
            target_date = datetime.now() - timedelta(days=days_back)
            date_input = driver.find_element(By.ID, "txtDate")
            date_input.clear()
            date_input.send_keys(target_date.strftime('%d-%b-%Y'))
            
            # Click first Go button to load markets
            go_button = driver.find_element(By.ID, 'btnGo')
            go_button.click()
            
            # Wait for markets to load
            time.sleep(3)
            
            # Select market if specified
            if market:
                try:
                    market_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlMarket')))
                    market_select = Select(market_dropdown)
                    
                    # Try exact match first, then partial match
                    try:
                        market_select.select_by_visible_text(market)
                    except:
                        for option in market_select.options:
                            if market.lower() in option.text.lower():
                                market_select.select_by_visible_text(option.text)
                                break
                        else:
                            # If no market specified or found, select first available market
                            if len(market_select.options) > 1:
                                market_select.select_by_index(1)  # Skip "--Select--" option
                    
                    # Click second Go button to get data
                    go_button = driver.find_element(By.ID, 'btnGo')
                    go_button.click()
                    
                except Exception as e:
                    logger.warning(f"Market selection failed: {e}")
            
            # Wait for results table
            time.sleep(2)
            
            # Try to find the data table
            try:
                table = wait.until(EC.presence_of_element_located((By.ID, 'cphBody_GridPriceData')))
                soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                # Parse the table data
                data_list = []
                rows = soup.find_all("tr")
                
                for row in rows:
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 8:  # Ensure we have enough columns
                        row_data = [cell.get_text().strip() for cell in cells]
                        data_list.append(row_data)
                
                # Convert to structured JSON format
                json_list = []
                for i, row_data in enumerate(data_list[4:len(data_list)-1]):  # Skip header and footer rows
                    if len(row_data) >= 10:  # Ensure we have all required columns
                        try:
                            price_data = {
                                "S.No": row_data[1] if len(row_data) > 1 else str(i+1),
                                "City": row_data[2] if len(row_data) > 2 else market or "Unknown",
                                "Commodity": row_data[4] if len(row_data) > 4 else commodity,
                                "Min Prize": row_data[7] if len(row_data) > 7 else "NR",
                                "Max Prize": row_data[8] if len(row_data) > 8 else "NR",
                                "Model Prize": row_data[9] if len(row_data) > 9 else "NR",
                                "Date": row_data[10] if len(row_data) > 10 else target_date.strftime('%d-%b-%Y'),
                                "State": state,
                                "Market": market or row_data[2] if len(row_data) > 2 else "Unknown"
                            }
                            json_list.append(price_data)
                        except Exception as e:
                            logger.warning(f"Error parsing row data: {e}")
                            continue
                
                return json_list
                
            except TimeoutException:
                logger.warning(f"No data table found for {commodity} in {state}")
                return []
                
        except Exception as e:
            logger.error(f"Error scraping data for {commodity} in {state}: {e}")
            return []
        
        finally:
            driver.quit()
    
    def get_available_markets_for_state(self, state: str, commodity: str = "Onion") -> List[str]:
        """Get list of available markets for a given state"""
        driver = self.setup_selenium_driver()
        if not driver:
            return []
        
        try:
            driver.get(self.base_url)
            wait = WebDriverWait(driver, 10)
            
            # Select commodity
            commodity_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlCommodity')))
            commodity_select = Select(commodity_dropdown)
            commodity_select.select_by_visible_text(commodity)
            
            # Select state
            state_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlState')))
            state_select = Select(state_dropdown)
            state_select.select_by_visible_text(state)
            
            # Set date to today
            date_input = driver.find_element(By.ID, "txtDate")
            date_input.clear()
            date_input.send_keys(datetime.now().strftime('%d-%b-%Y'))
            
            # Click Go button to load markets
            go_button = driver.find_element(By.ID, 'btnGo')
            go_button.click()
            
            # Wait for markets to load
            time.sleep(3)
            
            # Get market options
            try:
                market_dropdown = wait.until(EC.presence_of_element_located((By.ID, 'ddlMarket')))
                market_select = Select(market_dropdown)
                
                markets = []
                for option in market_select.options[1:]:  # Skip "--Select--" option
                    markets.append(option.text.strip())
                
                return markets
                
            except Exception as e:
                logger.warning(f"Could not load markets for {state}: {e}")
                return []
                
        except Exception as e:
            logger.error(f"Error getting markets for {state}: {e}")
            return []
        
        finally:
            driver.quit()
    
    def scrape_multiple_commodities_parallel(self, state: str, commodities: List[str], market: str = None, max_workers: int = 3) -> Dict[str, List[Dict]]:
        """Scrape multiple commodities in parallel for better performance"""
        results = {}
        
        # Use ThreadPoolExecutor for parallel execution
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {}
            
            for commodity in commodities:
                future = executor.submit(self.scrape_single_commodity_data, state, commodity, market)
                futures[commodity] = future
            
            # Collect results
            for commodity, future in futures.items():
                try:
                    result = future.result(timeout=60)  # 60 second timeout per commodity
                    results[commodity] = result
                except Exception as e:
                    logger.error(f"Failed to scrape {commodity}: {e}")
                    results[commodity] = []
        
        return results
    
    def get_comprehensive_kerala_data(self, commodities: List[str] = None) -> Dict[str, Dict[str, List[Dict]]]:
        """Get comprehensive data for all Kerala mandis and specified commodities"""
        if not commodities:
            commodities = ["Onion", "Potato", "Tomato", "Rice", "Coconut", "Rubber", "Pepper", "Cardamom"]
        
        kerala_data = {}
        
        # Get available markets for Kerala
        available_markets = self.get_available_markets_for_state("Kerala")
        
        # Filter markets that match our known Kerala mandis
        kerala_markets = []
        for market in available_markets:
            for known_mandi in self.kerala_mandis.keys():
                if known_mandi.lower() in market.lower() or market.lower() in known_mandi.lower():
                    kerala_markets.append(market)
                    break
        
        # If no specific matches, use first few available markets
        if not kerala_markets:
            kerala_markets = available_markets[:5] if len(available_markets) > 5 else available_markets
        
        logger.info(f"Scraping data for Kerala markets: {kerala_markets}")
        
        for market in kerala_markets:
            logger.info(f"Scraping data for market: {market}")
            market_data = self.scrape_multiple_commodities_parallel(
                state="Kerala",
                commodities=commodities,
                market=market,
                max_workers=2
            )
            kerala_data[market] = market_data
        
        return kerala_data
    
    def scrape_state_summary(self, state: str, top_commodities: List[str] = None) -> Dict[str, List[Dict]]:
        """Get summary data for a state with top commodities"""
        if not top_commodities:
            top_commodities = ["Onion", "Potato", "Tomato", "Rice", "Wheat"]
        
        logger.info(f"Scraping summary data for {state}")
        return self.scrape_multiple_commodities_parallel(
            state=state,
            commodities=top_commodities,
            market=None,  # Get data from all available markets
            max_workers=3
        )
    
    def get_realtime_price_data(self, state: str, commodity: str, market: str = None) -> List[Dict]:
        """Get real-time price data for immediate API response"""
        logger.info(f"Getting real-time data: {commodity} in {state} - {market}")
        return self.scrape_single_commodity_data(state, commodity, market, days_back=0)
    
    def cleanup_price_data(self, data: List[Dict]) -> List[Dict]:
        """Clean and validate price data"""
        cleaned_data = []
        
        for item in data:
            try:
                # Clean price values
                for price_field in ['Min Prize', 'Max Prize', 'Model Prize']:
                    if price_field in item:
                        price_value = item[price_field]
                        if price_value and price_value != 'NR':
                            # Remove currency symbols and extra spaces
                            cleaned_price = price_value.replace('₹', '').replace(',', '').strip()
                            try:
                                # Validate it's a number
                                float(cleaned_price)
                                item[price_field] = cleaned_price
                            except ValueError:
                                item[price_field] = 'NR'
                        else:
                            item[price_field] = 'NR'
                
                # Ensure required fields exist
                required_fields = ['S.No', 'City', 'Commodity', 'Date']
                if all(field in item for field in required_fields):
                    cleaned_data.append(item)
                
            except Exception as e:
                logger.warning(f"Error cleaning price data: {e}")
                continue
        
        return cleaned_data

# Factory function to create scraper instance
def create_scraper():
    return AgmarknetScraper()

# Example usage functions
if __name__ == "__main__":
    # Example usage
    scraper = create_scraper()
    
    # Test Kerala data scraping
    kerala_data = scraper.get_comprehensive_kerala_data(["Onion", "Tomato", "Rice"])
    print(json.dumps(kerala_data, indent=2))
    
    # Test single commodity
    onion_data = scraper.get_realtime_price_data("Kerala", "Onion", "Kottayam")
    cleaned_data = scraper.cleanup_price_data(onion_data)
    print(json.dumps(cleaned_data, indent=2))
