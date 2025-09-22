
"use client";
import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth'; 
import { Loader2 } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import type { User } from 'firebase/auth';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M21.35 11.1h-9.2v2.7h5.3c-.2 1.1-.9 2-2.1 2.7v1.9c2.1-1 3.8-3.1 3.8-5.7 0-.6-.1-1.1-.2-1.6z"></path>
    <path fill="#34A853" d="M12.15 21.5c2.5 0 4.6-.8 6.1-2.2l-1.9-1.5c-.8.5-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-4H2.9v1.9C4.6 19.5 7.9 21.5 12.15 21.5z"></path>
    <path fill="#FBBC05" d="M7.85 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V9H2.9c-.7 1.4-1.2 3-1.2 4.7s.5 3.3 1.2 4.7l4.9-1.9z"></path>
    <path fill="#EA4335" d="M12.15 6.5c1.4 0 2.6.5 3.5 1.4l1.8-1.8C15.9 4.6 14.1 3.5 12.15 3.5c-4.2 0-7.5 2.9-9.2 6.6l4.9 1.9c.7-2.2 2.9-3.9 5.3-3.9z"></path>
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.95C18.05 21.45 22 17.19 22 12z"/>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, loginWithGoogle, loginWithFacebook, isLoading, error } = useAuth();
  
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);
  
  useEffect(() => {
    if (error) {
       toast.error(error.message || "No se pudo completar el inicio de sesión.", {
         title: "Error de inicio de sesión",
       });
    }
  }, [error]);

  const handleLogin = async (loginMethod: () => Promise<User | undefined>) => {
    try {
        const firebaseUser = await loginMethod();
        if (firebaseUser?.uid) {
            toast.success("Has iniciado sesión correctamente.", { title: "¡Bienvenido!" });
            onClose();
        }
    } catch (e: any) {
        toast.error(`Error al iniciar sesión: ${e.message}`, { title: "Error" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Accede a tu cuenta
          </DialogTitle>
          <DialogDescription className="text-center">
            Usa tu proveedor preferido para continuar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isLoading ? (
             <div className="flex flex-col justify-center items-center p-8 space-y-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Iniciando sesión...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
                <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 p-3 h-auto transition-colors"
                    onClick={() => handleLogin(loginWithGoogle)}
                    disabled={isLoading}
                >
                    <GoogleIcon />
                    <span className="text-sm">Continuar con Google</span>
                </Button>
                 <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 p-3 h-auto transition-colors"
                    onClick={() => handleLogin(loginWithFacebook)}
                    disabled={isLoading}
                >
                    <FacebookIcon />
                    <span className="text-sm">Continuar con Facebook</span>
                </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
