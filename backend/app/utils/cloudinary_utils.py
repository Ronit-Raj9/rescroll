import cloudinary
import cloudinary.uploader
from app.core.config import settings
from fastapi import UploadFile
import uuid

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image(file: UploadFile, folder: str = "profile_images") -> str:
    """
    Upload an image to Cloudinary and return the URL.
    
    Args:
        file: The image file to upload
        folder: The folder to upload to in Cloudinary
        
    Returns:
        The URL of the uploaded image
    """
    # Generate a unique filename
    filename = f"{uuid.uuid4()}"
    
    # Read the file content
    contents = await file.read()
    
    # Upload to Cloudinary
    result = cloudinary.uploader.upload(
        contents,
        folder=folder,
        public_id=filename,
        overwrite=True,
        resource_type="image"
    )
    
    # Return the URL
    return result["secure_url"]

def delete_image(url: str) -> bool:
    """
    Delete an image from Cloudinary.
    
    Args:
        url: The URL of the image to delete
        
    Returns:
        True if the image was deleted, False otherwise
    """
    try:
        # Extract the public_id from the URL
        # URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
        parts = url.split('/')
        folder_and_filename = '/'.join(parts[-2:])
        public_id = folder_and_filename.split('.')[0]
        
        # Delete the image
        result = cloudinary.uploader.destroy(public_id)
        
        return result["result"] == "ok"
    except Exception:
        return False 