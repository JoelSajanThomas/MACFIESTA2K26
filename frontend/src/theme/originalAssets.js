/** Paths for original (non-studio) MacFiesta Marvel × DC theme artwork. */

const OR = (path) => `/assets/image all/original/${path}`;

export const ORIGINAL_HERO_IMAGES = {
  scarletOrbit: OR("hero-scarlet-orbit.webp"),
  cobaltVigil: OR("hero-cobalt-vigil.webp"),
};

export const ORIGINAL_EMBLEM_IMAGES = {
  redUniverse: OR("emblem-red-universe.webp"),
  blueUniverse: OR("emblem-blue-universe.webp"),
};

export const ORIGINAL_BACKGROUNDS = {
  redCity: OR("backgrounds/red-universe-city.svg"),
  blueCity: OR("backgrounds/blue-universe-city.svg"),
  portal: OR("backgrounds/central-portal.svg"),
  cosmic: OR("backgrounds/cosmic-collision.svg"),
  command: OR("backgrounds/command-center.svg"),
  hall: OR("backgrounds/hall-of-heroes.svg"),
  briefing: OR("backgrounds/mission-briefing.svg"),
  arena: OR("backgrounds/event-arena.svg"),
  guest: OR("backgrounds/guest-stage.svg"),
  certificate: OR("backgrounds/certificate.svg"),
  pass: OR("backgrounds/digital-pass.svg"),
  mobileHero: OR("backgrounds/mobile-hero.svg"),
};

export const ORIGINAL_EMBLEMS_DIR = OR("emblems/");
