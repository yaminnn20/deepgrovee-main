import { Message } from "ai/react";
import { useMessageData } from "../context/MessageMetadata";
import { useAudioStore } from "../context/AudioStore";
import { voiceMap } from "../context/Deepgram";
import moment from "moment";

const MessageHeader = ({
  message,
  className = "",
}: {
  message: Message;
  className?: string;
}) => {
  const { audioStore } = useAudioStore();
  const { messageData } = useMessageData();

  const foundAudio = audioStore.findLast((item) => item.id === message.id);
  const foundData = messageData.findLast((item) => item.id === message.id);

  if (message.role === "assistant") {
    return (
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <span className="text-sm font-medium text-gray-800">
          {foundAudio?.model
            ? voiceMap(foundAudio?.model).name
            : foundData?.ttsModel
              ? voiceMap(foundData?.ttsModel).name
              : "Aura AI"}
        </span>
        <span className="text-xs text-gray-500">
          {moment().calendar()}
        </span>
      </div>
    );
  }

  return null;
};

export { MessageHeader };