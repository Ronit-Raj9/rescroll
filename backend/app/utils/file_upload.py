import os
import shutil
from fastapi import UploadFile
from typing import Optional
from ..utils.api_error import BadRequestError
from pathlib import Path

UPLOAD_DIR = "static"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_file_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[1].lower() if "." in filename else ""

def is_valid_file(file: UploadFile) -> bool:
    extension = get_file_extension(file.filename)
    return extension in ALLOWED_EXTENSIONS

async def save_upload_file(
    upload_file: UploadFile,
    subdirectory: str,
    filename: Optional[str] = None
) -> str:
    """
    Save an uploaded file to the specified subdirectory.
    Returns the relative path to the saved file.
    """
    if not upload_file:
        return None

    if not is_valid_file(upload_file):
        raise BadRequestError(
            message="Invalid file type",
            errors={"file": f"File must be one of: {', '.join(ALLOWED_EXTENSIONS)}"}
        )

    # Create directory if it doesn't exist
    save_dir = os.path.join(UPLOAD_DIR, subdirectory)
    os.makedirs(save_dir, exist_ok=True)

    # Generate filename if not provided
    if not filename:
        extension = get_file_extension(upload_file.filename)
        filename = f"{upload_file.filename}"

    # Full path where file will be saved
    file_path = os.path.join(save_dir, filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    except Exception as e:
        raise BadRequestError(
            message="Failed to save file",
            errors={"file": str(e)}
        )

    # Return relative path
    return os.path.join(subdirectory, filename)

async def delete_upload_file(file_path: str) -> bool:
    """
    Delete a previously uploaded file.
    Returns True if file was deleted, False if file didn't exist.
    """
    if not file_path:
        return False

    full_path = os.path.join(UPLOAD_DIR, file_path)
    try:
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
    except Exception:
        pass
    return False 