"""Central utility to determine if festival registration / participant account creation is currently open."""

import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def is_registration_open() -> bool:
    """Returns True if user registration is active, False if closed.

    Checks:
      1. Django settings.REGISTRATION_OPEN (e.g. from environment variable REGISTRATION_OPEN)
      2. cms.models.SiteSetting.is_registration_open (database configuration)
    """
    # 1. Environment / settings override
    env_setting = getattr(settings, "REGISTRATION_OPEN", None)
    if env_setting is not None and not bool(env_setting):
        return False

    # 2. Database dynamic configuration
    try:
        from cms.models import SiteSetting

        site_setting = SiteSetting.objects.first()
        if site_setting is not None:
            return bool(site_setting.is_registration_open)
    except Exception as exc:
        logger.warning("Could not read is_registration_open from SiteSetting: %s", exc)

    return True
