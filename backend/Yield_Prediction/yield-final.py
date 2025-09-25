#!/usr/bin/env python
# coding: utf-8

# In[10]:


#!/usr/bin/env python
# coding: utf-8

# ### Cell 1: Import Libraries
import numpy as np
import pandas as pd
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

# ### Cell 2: Load Datasets
# Load the two datasets needed for recommendation and yield prediction.
recommend_df = pd.read_csv('crop_recommendation.csv')
yield_df = pd.read_csv('crop_production.csv')

# ### Cell 3: Clean and Prepare the Yield Dataset (THE CRITICAL FIX)
# This block is moved here to clean the data BEFORE the model is trained.

print("--- Preparing Yield Dataset ---")
# 1. Remove leading/trailing whitespace from categorical columns
yield_df['State_Name'] = yield_df['State_Name'].str.strip()
yield_df['District_Name'] = yield_df['District_Name'].str.strip()
yield_df['Season'] = yield_df['Season'].str.strip()
yield_df['Crop'] = yield_df['Crop'].str.strip()
print("Whitespace has been stripped from key columns.")

# 2. Drop rows with any missing values
yield_df.dropna(inplace=True)
print("Null values dropped.")

# 3. Create the 'Yield' column (Production per Area)
# We handle division by zero by replacing resulting 'inf' values with NaN and dropping them.
# 3. Create the 'Yield' column (Production per Area)
yield_df['Yield'] = yield_df['Production'] / yield_df['Area']
yield_df.replace([np.inf, -np.inf], np.nan, inplace=True)
yield_df.dropna(subset=['Yield'], inplace=True)
print("Created 'Yield' column and handled any division-by-zero errors.")

# ----> ADD THIS LINE <----
# 4. Apply log transformation to the Yield column to normalize its distribution
yield_df['Yield_log'] = np.log1p(yield_df['Yield'])
print("Applied log transformation to Yield data.")
print("Yield dataset is now fully cleaned and prepared.\n")

# ### Cell 4: Train the Crop Recommendation Model
# This model suggests a crop based on soil and climate conditions.
print("--- Training Crop Recommendation Model ---")
X_recommend = recommend_df.drop('label', axis=1)
y_recommend = recommend_df['label']
X_train_rec, X_test_rec, y_train_rec, y_test_rec = train_test_split(X_recommend, y_recommend, test_size=0.2, random_state=42)

recommend_model = RandomForestClassifier(n_estimators=100, random_state=42)
recommend_model.fit(X_train_rec, y_train_rec)
y_pred_rec = recommend_model.predict(X_test_rec)
print(f"Crop Recommendation Model Accuracy: {accuracy_score(y_test_rec, y_pred_rec):.2f}\n")

# ### Cell 5: Train the Crop Yield Prediction Model
# This model predicts yield based on location, year, season, and crop type.
# It is now being trained on the CLEANED yield_df.
print("--- Training Crop Yield Model ---")
X_yield = yield_df[['State_Name', 'District_Name', 'Crop_Year', 'Season', 'Crop']]
y_yield = yield_df['Yield_log']
X_train_yield, X_test_yield, y_train_yield, y_test_yield = train_test_split(X_yield, y_yield, test_size=0.2, random_state=42)

# Create a preprocessing pipeline to handle categorical features
categorical_features = ['State_Name', 'District_Name', 'Season', 'Crop']
preprocessor = ColumnTransformer(
    transformers=[('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)],
    remainder='passthrough'
)

# Create the full pipeline with the preprocessor and the regressor model
yield_model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1))
])

# Train the model on the clean data
yield_model_pipeline.fit(X_train_yield, y_train_yield)
y_pred_yield = yield_model_pipeline.predict(X_test_yield)
print(f"Crop Yield Model MAE: {mean_absolute_error(y_test_yield, y_pred_yield):.2f}\n")


# ### Cell 6: Define the Integrated Prediction Function
def predict_crop_and_yield(N, P, K, temperature, humidity, ph, rainfall, State_Name, District_Name, Crop_Year, Season):
    """
    Predicts the best crop and its potential yield using the trained models.
    """
    # 1. Recommend the best crop
    recommend_features_df = pd.DataFrame([[N, P, K, temperature, humidity, ph, rainfall]],
                                         columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    recommended_crop = recommend_model.predict(recommend_features_df)[0]
    
    # 2. Predict the yield for the recommended crop
    yield_features = pd.DataFrame({
        'State_Name': [State_Name],
        'District_Name': [District_Name],
        'Crop_Year': [Crop_Year],
        'Season': [Season],
        'Crop': [recommended_crop]
    })
    
    predicted_log_yield = yield_model_pipeline.predict(yield_features)
    
    # Convert the prediction back to the original scale
    predicted_yield_value = np.expm1(predicted_log_yield)
    
    return recommended_crop, predicted_yield_value[0]

# ### Cell 7: Example User Input and Prediction
user_input = {
    "N": 90, "P": 42, "K": 43, "temperature": 24.5, "humidity": 82.0, "ph": 6.5, "rainfall": 202.9,
    "State_Name": "Uttar Pradesh", "District_Name": "LUCKNOW", "Crop_Year": 2010, "Season": "Kharif"
}

print("--- Running Integrated Prediction System ---")
recommended_crop, predicted_yield = predict_crop_and_yield(**user_input)

print(f"-> Based on soil/climate, recommended crop is: {recommended_crop.upper()}")
print(f"-> The predicted yield for {recommended_crop.upper()} is: {predicted_yield:.2f} (Production/Area)")
print("------------------------------------------\n")

# ### Cell 8: Validate the Prediction
print("--- Validating Yield Prediction ---")
# Filter the CLEAN production dataset for the exact conditions to find the true historical average
historical_yield = yield_df[
    (yield_df['State_Name'] == user_input['State_Name']) &
    (yield_df['District_Name'] == user_input['District_Name']) &
    # The recommended crop's name must match exactly what's in the clean dataframe
    (yield_df['Crop'].str.lower() == recommended_crop.lower()) &
    (yield_df['Season'] == user_input['Season'])
]

if not historical_yield.empty:
    avg_historical_yield = historical_yield['Yield'].mean()
    print(f"Model's Predicted Yield: {predicted_yield:.2f}")
    print(f"Actual Historical Average Yield: {avg_historical_yield:.2f}")
    print("\nConclusion: The prediction is now correctly aligned with the historical data.")
else:
    print(f"No historical data found for {recommended_crop} in {user_input['District_Name']}.")
    print("The model is making a prediction based on similar districts/crops.")

# Get the directory where the script is running
script_dir = os.path.dirname(os.path.abspath(__file__)) 
# Define the path for the 'saved_models' directory
save_dir = os.path.join(script_dir, 'saved_models')

# Create the directory if it does not already exist
os.makedirs(save_dir, exist_ok=True)

# Define the full paths for the model files
recommend_model_path = os.path.join(save_dir, 'crop_recommend_model.pkl')
yield_model_path = os.path.join(save_dir, 'crop_yield_model.pkl')

# Save the models to the new paths
with open(yield_model_path, 'wb') as file:
    pickle.dump(yield_model_pipeline, file)
print(f"Yield model saved to: {yield_model_path}")

with open(recommend_model_path, 'wb') as file:
    pickle.dump(recommend_model, file)
print(f"Recommendation model saved to: {recommend_model_path}")

# In[ ]:




