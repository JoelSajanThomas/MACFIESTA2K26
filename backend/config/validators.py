import os
import re

from django.core.exceptions import ValidationError
from PIL import Image

MAX_IMAGE_BYTES = 50 * 1024 * 1024
COMMON_IMAGE_EXTS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp",
    ".tiff", ".tif", ".ico", ".svg", ".avif", ".heic",
    ".heif", ".ppm", ".eps", ".raw", ".cr2", ".nef",
    ".arw", ".dng",
}


def validate_phone_number(value):
    if not value:
        raise ValidationError("Phone number is required.")
    digits = re.sub(r"\D", "", str(value))
    if len(digits) < 10 or len(digits) > 15:
        raise ValidationError("Enter a valid phone number (10–15 digits).")
    return value.strip()


def validate_uploaded_image(image):
    if not image:
        return image
    if image.size > MAX_IMAGE_BYTES:
        raise ValidationError("Image must be 50 MB or smaller.")

    name = getattr(image, "name", "").lower()
    ext = os.path.splitext(name)[1]
    content_type = getattr(image, "content_type", "").lower()

    # Allow SVG files
    if ext == ".svg" or "svg" in content_type:
        try:
            head = image.read(1024)
            image.seek(0)
            text = head.decode("utf-8", errors="ignore").lower()
            if "<svg" in text or "<?xml" in text:
                return image
        except Exception:
            pass

    # Verify standard raster images with PIL
    try:
        with Image.open(image) as img:
            img.verify()
    except Exception:
        # If the file has a recognizable image extension or MIME type, allow it
        if ext in COMMON_IMAGE_EXTS or content_type.startswith("image/"):
            image.seek(0)
            return image
        raise ValidationError("Invalid image file. Please upload a valid image (PNG, JPG, SVG, WEBP, GIF, etc.).")

    image.seek(0)
    return image

