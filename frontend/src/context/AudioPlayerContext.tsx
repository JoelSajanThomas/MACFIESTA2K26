import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { audioEngine, AudioEngineState } from "../services/audioEngine";
import { SongTrack } from "../services/songLibrary";

interface AudioPlayerContextValue extends AudioEngineState {
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  playTrack: (index: number) => void;
  toggleHighlightMode: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioEngineState>(() => audioEngine.getState());

  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AudioPlayerContextValue>(() => ({
    ...state,
    togglePlay: () => audioEngine.togglePlay(),
    play: () => audioEngine.play(),
    pause: () => audioEngine.pause(true),
    next: () => audioEngine.next(true),
    prev: () => audioEngine.prev(true),
    playTrack: (index: number) => audioEngine.playTrack(index, true),
    toggleHighlightMode: () => audioEngine.toggleHighlightMode(),
  }), [state]);

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    // Return fallback standalone hook that directly connects to audioEngine
    // so components can also be used without requiring a Provider wrap
    return useStandaloneAudioPlayer();
  }
  return ctx;
}

function useStandaloneAudioPlayer(): AudioPlayerContextValue {
  const [state, setState] = useState<AudioEngineState>(() => audioEngine.getState());

  useEffect(() => {
    return audioEngine.subscribe((newState) => {
      setState(newState);
    });
  }, []);

  return {
    ...state,
    togglePlay: () => audioEngine.togglePlay(),
    play: () => audioEngine.play(),
    pause: () => audioEngine.pause(true),
    next: () => audioEngine.next(true),
    prev: () => audioEngine.prev(true),
    playTrack: (index: number) => audioEngine.playTrack(index, true),
    toggleHighlightMode: () => audioEngine.toggleHighlightMode(),
  };
}
