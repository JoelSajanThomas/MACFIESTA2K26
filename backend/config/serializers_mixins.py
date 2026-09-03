from rest_framework import serializers

from config.validators import validate_uploaded_image


class ImageValidationMixin:
    def validate_image_fields(self, attrs):
        for field in (
            "image", "hero_image", "about_image", "logo_image", "logo",
            "winner_photo", "banner_image", "poster_image", "thumbnail", "payment_proof"
        ):
            if field in attrs and attrs[field]:
                validate_uploaded_image(attrs[field])
        return attrs

    def validate(self, attrs):
        attrs = super().validate(attrs)
        return self.validate_image_fields(attrs)
