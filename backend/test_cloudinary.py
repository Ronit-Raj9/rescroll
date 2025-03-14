import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.core.config import settings

def test_cloudinary_config():
    """Test if Cloudinary is configured correctly."""
    print("Cloudinary Configuration Testing")
    print("-------------------------------")
    print(f"CLOUDINARY_CLOUD_NAME: {settings.CLOUDINARY_CLOUD_NAME}")
    print(f"CLOUDINARY_API_KEY: {settings.CLOUDINARY_API_KEY}")
    print(f"CLOUDINARY_API_SECRET: {settings.CLOUDINARY_API_SECRET[:4]}...")  # Show just first few chars for security
    
    if not all([settings.CLOUDINARY_CLOUD_NAME, settings.CLOUDINARY_API_KEY, settings.CLOUDINARY_API_SECRET]):
        print("\n⚠️ ERROR: Cloudinary settings are not configured correctly!")
        return False
    
    # Configure Cloudinary
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET
    )
    
    # Try to ping Cloudinary
    try:
        print("\nTesting connection to Cloudinary...")
        # Try a simple upload test
        test_result = cloudinary.uploader.upload(
            "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
            public_id="test_image",
            folder="test",
            overwrite=True
        )
        print("✅ Cloudinary upload test successful!")
        print(f"Response URL: {test_result.get('secure_url', 'No URL returned')}")
        return True
    except Exception as e:
        print(f"❌ Cloudinary connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    test_cloudinary_config() 