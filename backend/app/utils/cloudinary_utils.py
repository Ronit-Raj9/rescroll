import cloudinary
import cloudinary.uploader
import cloudinary.api
import logging
from app.core.config import settings
from fastapi import UploadFile
import uuid

# Get the logger
logger = logging.getLogger(__name__)

# Function to check and configure Cloudinary
def ensure_cloudinary_config():
    """
    Ensure Cloudinary is configured correctly with fallback to environment variables.
    """
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        logger.warning("Cloudinary settings are not configured correctly. Image uploads may not work.")
    
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET
    )

# Initialize Cloudinary on module import
ensure_cloudinary_config()

async def upload_image(file: UploadFile, folder: str = "profile_images") -> str:
    """
    Upload an image to Cloudinary and return the URL.
    
    Args:
        file: The image file to upload
        folder: The folder to upload to in Cloudinary
        
    Returns:
        The URL of the uploaded image
    """
    try:
        # Re-check Cloudinary config
        ensure_cloudinary_config()
        
        # Generate a unique filename
        filename = f"{uuid.uuid4()}"
        
        # Reset file position to beginning
        await file.seek(0)
        
        # Read the file content
        contents = await file.read()
        
        if not contents:
            raise ValueError("Empty file content")
        
        # Get file extension from content type
        content_type = file.content_type
        extension = content_type.split('/')[-1] if content_type else "jpg"
        
        # Log the upload attempt
        logger.info(f"Uploading file with content type {content_type} to Cloudinary")
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            public_id=f"{filename}.{extension}",
            overwrite=True,
            resource_type="auto"
        )
        
        logger.info(f"File uploaded successfully to Cloudinary. URL: {result['secure_url']}")
        
        # Return the URL
        return result["secure_url"]
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error uploading to Cloudinary: {str(e)}")
        raise

def delete_image(url: str) -> bool:
    """
    Delete an image from Cloudinary.
    
    Args:
        url: The URL of the image to delete
        
    Returns:
        True if the image was deleted, False otherwise
    """
    try:
        # Check if URL is None or empty
        if not url:
            logger.warning("Attempted to delete an empty or None URL")
            return False
            
        # Re-check Cloudinary config
        ensure_cloudinary_config()
        
        # Extract the public_id from the URL
        # URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
        parts = url.split('/')
        folder_and_filename = '/'.join(parts[-2:])
        public_id = folder_and_filename.split('.')[0]
        
        logger.info(f"Attempting to delete image with public_id: {public_id}")
        
        # Delete the image
        result = cloudinary.uploader.destroy(public_id)
        
        logger.info(f"Image delete result: {result}")
        
        return result["result"] == "ok"
    except Exception as e:
        logger.error(f"Error deleting image from Cloudinary: {str(e)}")
        return False 