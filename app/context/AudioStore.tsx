"use client";

import { createContext, useCallback, useContext, useState, useEffect } from "react";

type AudioStoreContext = {
  audioStore: AudioPacket[];
  addAudio: (queueItem: AudioPacket) => void;
  removeAudio: (audio: AudioPacket) => void;
};

export interface AudioPacket {
  id: string;
  blob: Blob;
  latency: number;
  networkLatency: number;
  model: string;
}

interface AudioStoreItemContextInterface {
  children: React.ReactNode;
}

const AudioStoreContext = createContext({} as AudioStoreContext);

export const AudioStoreContextProvider = ({
  children,
}: AudioStoreItemContextInterface) => {
  const [audioStore, setAudioStore] = useState<AudioPacket[]>([]);

  const addAudio = useCallback((queueItem: AudioPacket): void => {
    setAudioStore((q) => [...q, queueItem]);
  }, []);

  const removeAudio = useCallback((audio: AudioPacket): void => {
    // Revoke the blob URL to free up memory
    if (audio.blob) {
      URL.revokeObjectURL(URL.createObjectURL(audio.blob));
    }
    setAudioStore((q) => q.filter((item) => item.id !== audio.id));
  }, []);

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all audio blobs when the context is unmounted
      setAudioStore((currentStore) => {
        currentStore.forEach((audio) => {
          if (audio.blob) {
            URL.revokeObjectURL(URL.createObjectURL(audio.blob));
          }
        });
        return [];
      });
    };
  }, []); // Remove audioStore from dependencies

  return (
    <AudioStoreContext.Provider
      value={{
        audioStore,
        addAudio,
        removeAudio,
      }}
    >
      {children}
    </AudioStoreContext.Provider>
  );
};

export function useAudioStore() {
  return useContext(AudioStoreContext);
}
