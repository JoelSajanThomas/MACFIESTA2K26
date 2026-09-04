/**
 * Device Capability & Performance Tier Detector
 * Helps MacFiesta adaptively scale back heavy 3D canvases, frame preloading,
 * and animations on low-memory, budget mobile devices and slow connections.
 */

export interface DeviceTier {
  isMobile: boolean;
  isTouch: boolean;
  isLowEnd: boolean;
  isSaveData: boolean;
  isSlowNetwork: boolean;
}

export function getDeviceCapabilities(): DeviceTier {
  if (typeof window === "undefined") {
    return {
      isMobile: false,
      isTouch: false,
      isLowEnd: false,
      isSaveData: false,
      isSlowNetwork: false,
    };
  }

  const width = window.innerWidth;
  const isTouch = "ontouchstart" in window || (navigator?.maxTouchPoints ?? 0) > 0;
  const isMobile = width < 768 || (isTouch && width < 1024);

  const nav = navigator as any;
  const conn = nav?.connection;
  const isSaveData = Boolean(conn?.saveData);
  const effectiveType = conn?.effectiveType || "";
  const isSlowNetwork = effectiveType === "2g" || effectiveType === "3g" || effectiveType === "slow-2g";

  const deviceMemory: number | undefined = nav?.deviceMemory;
  const hardwareConcurrency: number | undefined = nav?.hardwareConcurrency;
  const isLowHardware = (deviceMemory !== undefined && deviceMemory <= 4) || (hardwareConcurrency !== undefined && hardwareConcurrency <= 4);

  const prefersReducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false;

  const isLowEnd = isMobile || isSaveData || isSlowNetwork || isLowHardware || prefersReducedMotion;

  return {
    isMobile,
    isTouch,
    isLowEnd,
    isSaveData,
    isSlowNetwork,
  };
}

export function isLowEndDevice(): boolean {
  return getDeviceCapabilities().isLowEnd;
}

export function isMobileOrTouch(): boolean {
  const cap = getDeviceCapabilities();
  return cap.isMobile || cap.isTouch;
}
