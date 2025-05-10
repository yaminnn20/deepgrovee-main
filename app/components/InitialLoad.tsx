import { Headphones } from "./Headphones";
import { isBrowser } from "react-device-detect";
import { Spinner, Select, SelectItem } from "@nextui-org/react";
import { useDeepgram } from "../context/Deepgram";
import { useState } from "react";

export const InitialLoad = ({ fn, connecting = true }: { fn: () => void, connecting: boolean }) => {
  const { sttOptions, setSttOptions, supportedLanguages } = useDeepgram();
  const [language, setLanguage] = useState<string>(sttOptions?.language || "en");

  const handleStart = () => {
    setSttOptions({ ...sttOptions, language });
    fn();
  };

  return (
    <div className="col-start-1 col-end-13 sm:col-start-4 sm:col-end-10 md:col-start-5 md:col-end-9 lg:col-start-6 lg:col-end-8 p-2">
      <div className="relative block w-full max-w-md mx-auto bg-white shadow-md p-6 sm:p-4 rounded-xl border border-gray-100">
        <h2 className="font-favorit block font-bold text-xl text-gray-800 text-center">
          Welcome to Reorbe&apos;s Conversational AI Demo
        </h2>

        {/* Start Button */}
        <div className="mt-4 flex justify-center">
          <button
            disabled={connecting}
            onClick={handleStart}
            className="bg-blue-600 text-white rounded-lg px-5 py-2 font-semibold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size="sm" color="white" />
                <span>Connecting...</span>
              </div>
            ) : (
              <>{isBrowser ? "Click" : "Tap"} here to start</>
            )}
          </button>
        </div>

        {/* Language Selection Dropdown */}
        <div className="mt-4">
          <Select
            label="Select Language"
            selectedKeys={[language]}
            onSelectionChange={(keys) => {
              const selectedKey = Array.from(keys)[0];
              setLanguage(selectedKey as string);
            }}
            items={supportedLanguages}
            color="primary"
            variant="bordered"
            classNames={{
              label: "text-gray-700 group-data-[filled=true]:-translate-y-3",
              trigger: "min-h-unit-10 bg-white border-gray-200",
              listboxWrapper: "max-h-[250px]",
            }}
            listboxProps={{
              itemClasses: {
                base: [
                  "rounded-md",
                  "text-gray-700",
                  "transition-colors",
                  "data-[hover=true]:text-blue-600",
                  "data-[hover=true]:bg-blue-50",
                  "data-[selectable=true]:focus:bg-blue-50",
                  "data-[pressed=true]:opacity-70",
                  "data-[focus-visible=true]:ring-blue-500",
                ],
              },
            }}
            popoverProps={{
              classNames: {
                base: "before:bg-gray-200",
                content: "p-0 border border-gray-200 bg-white",
              },
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <span className="text-gray-800">{item.data?.name}</span>
                    <span className="text-gray-500 text-xs">
                      ({item.data?.code})
                    </span>
                  </div>
                </div>
              ));
            }}
          >
            {(language) => (
              <SelectItem key={language.code} textValue={language.code}>
                <div className="flex gap-2 items-center">
                  <div className="flex flex-col">
                    <span className="text-gray-800">{language.name}</span>
                    <span className="text-gray-500 text-xs">
                      {language.code}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-center text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <Headphones />
            <span>For optimal performance, we recommend using headphones.</span>
          </div>
          <p className="mt-1 text-gray-500">
            Minor bugs and annoyances may appear while using this demo.
          </p>
        </div>
      </div>
    </div>
  );
};