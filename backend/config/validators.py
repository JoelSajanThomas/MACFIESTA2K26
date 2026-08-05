import re

from django.core.exceptions import ValidationError
from PIL import Image

MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}


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
        raise ValidationError("Image must be 5 MB or smaller.")
    try:
        with Image.open(image) as img:
            img.verify()
            if img.format not in ALLOWED_IMAGE_FORMATS:
                raise ValidationError("Unsupported image format. Use JPEG, PNG, WEBP, or GIF.")
    except ValidationError:
        raise
    except Exception as exc:
        raise ValidationError("Invalid image file.") from exc
    image.seek(0)
    return image
