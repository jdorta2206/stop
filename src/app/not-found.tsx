"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { translate } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-5xl font-bold mb-4 text-primary">404</h1>
      <p className="text-xl text-muted-foreground mb-8">
        {translate("notFound.title")}
      </p>
      <Button 
        onClick={() => router.push('/')}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {translate("notFound.button")}
      </Button>
    </div>
  );
}
