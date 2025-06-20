"use client";

import { useQueue } from "@uidotdev/usehooks";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type MicrophoneContext = {
  microphone: MediaRecorder | undefined;
  setMicrophone: Dispatch<SetStateAction<MediaRecorder | undefined>>;
  startMicrophone: () => void;
  stopMicrophone: () => void;
  microphoneOpen: boolean;
  enqueueBlob: (element: Blob) => void;
  removeBlob: () => Blob | undefined;
  firstBlob: Blob | undefined;
  queueSize: number;
  queue: Blob[];
  stream: MediaStream | undefined;
  microphoneError: string | null;
};

interface MicrophoneContextInterface {
  children: React.ReactNode;
}

const MicrophoneContext = createContext({} as MicrophoneContext);

const MicrophoneContextProvider = ({
  children,
}: MicrophoneContextInterface) => {
  const [microphone, setMicrophone] = useState<MediaRecorder>();
  const [stream, setStream] = useState<MediaStream>();
  const [microphoneOpen, setMicrophoneOpen] = useState(false);
  const [microphoneError, setMicrophoneError] = useState<string | null>(null);

  const {
    add: enqueueBlob, // addMicrophoneBlob,
    remove: removeBlob, // removeMicrophoneBlob,
    first: firstBlob, // firstMicrophoneBlob,
    size: queueSize, // countBlobs,
    queue, // : microphoneBlobs,
  } = useQueue<Blob>([]);

  useEffect(() => {
    async function setupMicrophone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true,
          },
        });
        setStream(stream);
        const microphone = new MediaRecorder(stream);
        setMicrophone(microphone);
        setMicrophoneError(null); // clear error if successful
      } catch (err: any) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setMicrophoneError("Microphone access was denied. Please allow access and try again.");
        } else {
          setMicrophoneError("An error occurred while accessing the microphone.");
        }
      }
    }

    if (!microphone && !microphoneError) {
      setupMicrophone();
    }
  }, [enqueueBlob, microphone, microphoneOpen, microphoneError]);

  useEffect(() => {
    if (!microphone) return;

    microphone.ondataavailable = (e) => {
      if (microphoneOpen) enqueueBlob(e.data);
    };

    return () => {
      microphone.ondataavailable = null;
    };
  }, [enqueueBlob, microphone, microphoneOpen]);

  const stopMicrophone = useCallback(() => {
    if (microphone?.state === "recording") microphone?.pause();

    setMicrophoneOpen(false);
  }, [microphone]);

  const startMicrophone = useCallback(() => {
    if (microphone?.state === "paused") {
      microphone?.resume();
    } else {
      microphone?.start(250);
    }

    setMicrophoneOpen(true);
  }, [microphone]);

  useEffect(() => {
    const eventer = () =>
      document.visibilityState !== "visible" && stopMicrophone();

    window.addEventListener("visibilitychange", eventer);

    return () => {
      window.removeEventListener("visibilitychange", eventer);
    };
  }, [stopMicrophone]);

  return (
    <MicrophoneContext.Provider
      value={{
        microphone,
        setMicrophone,
        startMicrophone,
        stopMicrophone,
        microphoneOpen,
        enqueueBlob,
        removeBlob,
        firstBlob,
        queueSize,
        queue,
        stream,
        microphoneError,
      }}
    >
      {children}
    </MicrophoneContext.Provider>
  );
};

function useMicrophone() {
  return useContext(MicrophoneContext);
}

export { MicrophoneContextProvider, useMicrophone };
