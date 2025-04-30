import { Message } from "ai/react";
import { DownloadIcon } from "./icons/DownloadIcon";
import { voiceMap } from "../context/Deepgram";
import { useAudioStore } from "../context/AudioStore";



export const Download = ({ messages }: { messages: Message[] }) => {
  const { audioStore } = useAudioStore();
  const context = messages
    .filter((m) => ["user", "assistant"].includes(m.role))
    .map((m) => {
      if (m.role === "assistant") {
        const foundAudio = audioStore.findLast((item) => item.id === m.id);
        const voice = foundAudio?.model
          ? voiceMap(foundAudio?.model).name
          : "Deepgram";

        return `${voice ?? "Helios"}: ${m.content}`;
      }

      if (m.role === "user") {
        return `User: ${m.content}`;
      }
    });
  
};
