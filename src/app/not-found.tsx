"use client";

import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { useLanguage } from "../contexts/language-context";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <AlertTriangle className="h-20 w-20 text-yellow-300 mb-6" />
      <h1 className="text-6xl font-extrabold mb-2 text-white">404</h1>
      <p className="text-2xl text-white/80 mb-10">
        {translate("notFound.title")}
      </p>
      <Button 
        onClick={() => router.push('/')}
        className="bg-white hover:bg-gray-200 text-red-600 font-bold py-3 px-8 text-lg rounded-full shadow-xl transition-transform hover:scale-105"
      >
        {translate("notFound.button")}
      </Button>
    </div>
  );
}
