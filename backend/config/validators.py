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
    """Validate Indian mobile numbers (must be exactly 10 digits starting with 6-9,
    or +91 prefix with 10 digits)."""
    if not value:
        raise ValidationError("Phone number is required.")
    stripped = re.sub(r"\s+", "", str(value).strip())
    digits = re.sub(r"\D", "", stripped)

    # 10 digits starting with 6-9
    if len(digits) == 10 and re.match(r"^[6-9]\d{9}$", digits):
        return digits
    # +91 prefix (12 digits total, remaining 10 start with 6-9)
    if len(digits) == 12 and digits.startswith("91") and re.match(r"^[6-9]\d{9}$", digits[2:]):
        return digits[2:]

    if len(digits) > 10:
        raise ValidationError("Mobile number cannot exceed 10 digits.")
    if len(digits) < 10:
        raise ValidationError("Mobile number must be exactly 10 digits.")
    raise ValidationError("Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.")


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

