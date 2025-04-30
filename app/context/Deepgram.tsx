"use client";

import {
  CreateProjectKeyResponse,
  LiveClient,
  LiveSchema,
  LiveTranscriptionEvents,
  SpeakSchema,
} from "@deepgram/sdk";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useToast } from "./Toast";
import { useLocalStorage } from "../lib/hooks/useLocalStorage";

type DeepgramContext = {
  ttsOptions: SpeakSchema | undefined;
  setTtsOptions: (value: SpeakSchema) => void;
  sttOptions: LiveSchema | undefined;
  setSttOptions: (value: LiveSchema) => void;
  connection: LiveClient | undefined;
  connectionReady: boolean;
  supportedLanguages: { code: string; name: string }[];
};

interface DeepgramContextInterface {
  children: React.ReactNode;
}

const DeepgramContext = createContext({} as DeepgramContext);

const DEFAULT_TTS_MODEL = 'aura-helios-en';
const DEFAULT_STT_MODEL = 'nova-3';

const defaultTtsOptions = {
  model: DEFAULT_TTS_MODEL,
};

const defaultSttOptions = {
  model: DEFAULT_STT_MODEL,
  interim_results: true,
  smart_format: true,
  endpointing: 800,
  utterance_end_ms: 1200,
  filler_words: true,
  language: "en", // Default language
};

/**
 * Supported Languages for STT
 */
const supportedLanguages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "nl", name: "Dutch" },
  { code: "hi", name: "Hindi" },
  { code: "ar", name: "Arabic" },
  // Add more languages as needed
];

/**
 * TTS Voice Options
 */
const voices: {
  [key: string]: {
    name: string;
    avatar: string;
    language: string;
    accent: string;
  };
} = {
  [DEFAULT_TTS_MODEL]: {
    name: "Helios",
    avatar: "/aura-helios-en.svg",
    language: "English",
    accent: "UK",
    
  },
  "aura-luna-en": {
    name: "Luna",
    avatar: "/aura-luna-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-stella-en": {
    name: "Stella",
    avatar: "/aura-stella-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-athena-en": {
    name: "Athena",
    avatar: "/aura-athena-en.svg",
    language: "English",
    accent: "UK",
  },
  "aura-hera-en": {
    name: "Hera",
    avatar: "/aura-hera-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-orion-en": {
    name: "Orion",
    avatar: "/aura-orion-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-arcas-en": {
    name: "Arcas",
    avatar: "/aura-arcas-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-perseus-en": {
    name: "Perseus",
    avatar: "/aura-perseus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-angus-en": {
    name: "Angus",
    avatar: "/aura-angus-en.svg",
    language: "English",
    accent: "Ireland",
  },
  "aura-orpheus-en": {
    name: "Orpheus",
    avatar: "/aura-orpheus-en.svg",
    language: "English",
    accent: "US",
  },
  "aura-asteria-en": {
    name: "Asteria",
    avatar: "/aura-asteria-en.svg",
    language: "English",
    accent: "US",
    
  },
  "aura-zeus-en": {
    name: "Zeus",
    avatar: "/aura-zeus-en.svg",
    language: "English",
    accent: "US",
  },
};

const voiceMap = (model: string) => {
  return voices[model];
};

const getApiKey = async (): Promise<string> => {
  const result: CreateProjectKeyResponse = await (
    await fetch("/api/authenticate", { cache: "no-store" })
  ).json();

  return result.key;
};

const DeepgramContextProvider = ({ children }: DeepgramContextInterface) => {
  const { toast } = useToast();
  const [ttsOptions, setTtsOptions] = useLocalStorage<SpeakSchema | undefined>('ttsModel');
  const [sttOptions, setSttOptions] = useLocalStorage<LiveSchema | undefined>('sttModel');
  const [connection, setConnection] = useState<LiveClient>();
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectionReady, setConnectionReady] = useState<boolean>(false);

  const connect = useCallback(
    async (options: LiveSchema) => {
      if (!connection && !connecting) {
        setConnecting(true);

        const connection = new LiveClient(
          await getApiKey(),
          {},
          options
        );

        setConnection(connection);
        setConnecting(false);
      }
    },
    [connecting, connection]
  );

  useEffect(() => {
    if (ttsOptions === undefined) {
      setTtsOptions(defaultTtsOptions);
    }

    if (sttOptions === undefined) {
      setSttOptions(defaultSttOptions);
    }

    if (connection === undefined && sttOptions) {
      connect(sttOptions);
    }
  }, [connect, connection, setSttOptions, setTtsOptions, sttOptions, ttsOptions]);

  useEffect(() => {
    if (sttOptions && connection) {
      console.log("Reconnecting with STT Options:", sttOptions); // Debugging
      connection.removeAllListeners();
      setConnection(undefined);
      setConnectionReady(false);
      connect(sttOptions);
    }
  }, [sttOptions]);

  useEffect(() => {
    if (connection && connection?.getReadyState() !== undefined) {
      connection.addListener(LiveTranscriptionEvents.Open, () => {
        setConnectionReady(true);
      });

      connection.addListener(LiveTranscriptionEvents.Close, () => {
        toast("The connection to Reorbe closed, we'll attempt to reconnect.");
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });

      connection.addListener(LiveTranscriptionEvents.Error, () => {
        toast(
          "An unknown error occurred. We'll attempt to reconnect to Reorbe."
        );
        setConnectionReady(false);
        connection.removeAllListeners();
        setConnection(undefined);
      });
    }

    return () => {
      setConnectionReady(false);
      connection?.removeAllListeners();
    };
  }, [connection, toast]);

  return (
    <DeepgramContext.Provider
      value={{
        ttsOptions,
        setTtsOptions,
        sttOptions,
        setSttOptions,
        connection,
        connectionReady,
        supportedLanguages,
      }}
    >
      {children}
    </DeepgramContext.Provider>
  );
};

function useDeepgram() {
  return useContext(DeepgramContext);
}

export { DeepgramContextProvider, useDeepgram, voiceMap, voices };