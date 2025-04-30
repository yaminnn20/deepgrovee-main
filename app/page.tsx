"use client";

import { useEffect } from "react";
import { init } from "@fullstory/browser";
import Conversation from "./components/Conversation";

export default function Home() {
  useEffect(() => {
    init({ orgId: "5HWAN" });
  }, []);

  return (
    <div className="h-full overflow-hidden bg-gray-50">
     {/* Transparent Header */}
<header className="bg-transparent border-b-0 shadow-none h-[3.5rem] flex items-center px-6">
  <div className="text-gray-800 text-xl font-bold">Orbe</div>
</header>
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-[calc(100%-5.5rem)]">
        <Conversation />
      </main>

      {/* Footer */}
      <footer className="bg-transparent border-b-0 h-[2.1rem] flex items-center justify-center shadow-none">
        <span className="text-gray-700 text-xs">Orbe is still under development, Verify its responses</span>
      </footer>
    </div>
  );
}
