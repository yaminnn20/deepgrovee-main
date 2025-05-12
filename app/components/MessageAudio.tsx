import { Message } from "ai/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAudioStore } from "../context/AudioStore";
import { useNowPlaying } from "react-nowplaying";

const MessageAudio = ({
  message: { id },
  className = "",
  ...rest
}: {
  message: Message;
  className?: string;
}) => {
  const { audioStore, removeAudio } = useAudioStore();
  const { player, uid, resume: resumeAudio, play: playAudio } = useNowPlaying();
  const [playing, setPlaying] = useState(false);
  const [playerElement, setPlayerElement] = useState<HTMLAudioElement | null>(null);

  const found = useMemo(() => {
    return audioStore.find((item) => item.id === id);
  }, [audioStore, id]);

  useEffect(() => {
    setPlaying(uid === id);
  }, [uid, id]);

  useEffect(() => {
    if (found?.blob) {
      const audioUrl = URL.createObjectURL(found.blob);
      const audioPlayer = new Audio(audioUrl);
      setPlayerElement(audioPlayer);

      // Cleanup function
      return () => {
        audioPlayer.pause();
        URL.revokeObjectURL(audioUrl);
        // Remove audio from store if it hasn't been played to completion
        if (!audioPlayer.ended) {
          removeAudio(found);
        }
      };
    }
  }, [found, removeAudio]);

  // Handle cleanup when audio ends
  useEffect(() => {
    if (playerElement && playerElement.ended && found) {
      removeAudio(found);
    }
  }, [playerElement?.ended, found, removeAudio]);

  const pause = useCallback(() => {
    if (!playerElement) return;

    playerElement.pause();
    setPlaying(false);
  }, [playerElement]);

  const play = useCallback(() => {
    if (!playerElement || !found) return;

    if (uid === found.id) {
      resumeAudio();
    } else if (found) {
      playAudio(found.blob, "audio/mp3", id);
    }

    setPlaying(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, found, id]);

  // Return null if audio is not found instead of showing a spinner
  if (!found) {
    return null;
  }

  return (
    <button
      onClick={playing ? pause : play}
      className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
        playing ? "bg-red-500" : "bg-gray-200 hover:bg-gray-300"
      } ${className}`}
      {...rest}
    >
      {playing ? (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-white"
        >
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 text-gray-600"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
};

export { MessageAudio };
