from huggingface_hub import hf_hub_download
import os

def download_models_from_hf():
    repo_id = "adityaarun1010/my-new-models"
    # Define the directory where models will be saved
    MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
    os.makedirs(MODEL_DIR, exist_ok=True)

    # Define the filenames of the models
    recommend_filename = "crop_recommend_model.pkl"
    yield_filename = "crop_yield_model.pkl"

    # Download the recommendation model
    hf_hub_download(
        repo_id=repo_id,
        filename=recommend_filename,
        local_dir=MODEL_DIR,
        local_dir_use_symlinks=False
    )
    print(f"Downloaded {recommend_filename} to {MODEL_DIR}")

    # Download the yield model
    hf_hub_download(
        repo_id=repo_id,
        filename=yield_filename,
        local_dir=MODEL_DIR,
        local_dir_use_symlinks=False
    )
    print(f"Downloaded {yield_filename} to {MODEL_DIR}")