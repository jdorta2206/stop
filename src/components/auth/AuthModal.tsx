
"use client";

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { signInWithPopup, AuthError } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../lib/firebase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}><path fill="#4285F4" d="M21.35 11.1h-9.2v2.7h5.3c-.2 1.1-.9 2-2.1 2.7v1.9c2.1-1 3.8-3.1 3.8-5.7 0-.6-.1-1.1-.2-1.6z"></path><path fill="#34A853" d="M12.15 21.5c2.5 0 4.6-.8 6.1-2.2l-1.9-1.5c-.8.5-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-4H2.9v1.9C4.6 19.5 7.9 21.5 12.15 21.5z"></path><path fill="#FBBC05" d="M7.85 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V9H2.9c-.7 1.4-1.2 3-1.2 4.7s.5 3.3 1.2 4.7l4.9-1.9z"></path><path fill="#EA4335" d="M12.15 6.5c1.4 0 2.6.5 3.5 1.4l1.8-1.8C15.9 4.6 14.1 3.5 12.15 3.5c-4.2 0-7.5 2.9-9.2 6.6l4.9 1.9c.7-2.2 2.9-3.9 5.3-3.9z"></path></svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}><path fill="#1877F2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3l-.5 3h-2.5v6.95C18.05 21.45 22 17.19 22 12z"/></svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [user, loading] = useAuthState(auth);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);

  useEffect(() => {
    // Si el usuario ya está logueado y el modal está abierto, ciérralo.
    if (user && isOpen) {
      toast.success("¡Inicio de sesión exitoso!");
      onClose();
    }
  }, [user, isOpen, onClose]);

  const handleLogin = async (providerName: 'google' | 'facebook') => {
    setIsProcessingLogin(true);
    const provider = providerName === 'google' 
      ? googleProvider
      : facebookProvider;
    
    try {
      await signInWithPopup(auth, provider);
      // El useEffect de arriba se encargará de cerrar el modal cuando `user` se actualice.
    } catch (error) {
      const authError = error as AuthError;
      console.error("Firebase Auth Error:", authError);
      
      let title = "Error al iniciar sesión";
      let description = "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";

      switch (authError.code) {
        case 'auth/account-exists-with-different-credential':
          title = "Cuenta ya existe";
          description = "Ya existe una cuenta con este email, pero fue creada con un proveedor diferente (ej: Google en vez de Facebook). Intenta iniciar sesión con el otro proveedor.";
          break;
        case 'auth/popup-closed-by-user':
          title = "Ventana cerrada";
          description = "Has cerrado la ventana de inicio de sesión antes de completar el proceso.";
          break;
        case 'auth/cancelled-popup-request':
           title = "Solicitud cancelada";
           description = "Se ha cancelado la solicitud de inicio de sesión.";
           break;
        case 'auth/unauthorized-domain':
            title = "Dominio no autorizado";
            description = "Este dominio no está permitido para la autenticación. Asegúrate de que `localhost` y el dominio de tu app estén en la lista de 'Dominios autorizados' en la configuración de Authentication de Firebase.";
            break;
        case 'auth/internal-error':
            title = "Error Interno de Firebase";
            description = "Esto usualmente significa que los proveedores (Google, Facebook) no están habilitados correctamente en la Consola de Firebase o hay un problema con la clave de API."
            break;
        case 'auth/network-request-failed':
          title = "Error de red";
          description = "No se pudo conectar con los servidores de Firebase. Revisa tu conexión a internet.";
          break;
        default:
          description = `Detalle: ${authError.message || 'Error desconocido'}. Código: ${authError.code}`;
          break;
      }

      toast.error(title, { description });
    } finally {
      setIsProcessingLogin(false);
    }
  };

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
          {isProcessingLogin || loading ? (
             <div className="flex flex-col justify-center items-center p-8 space-y-2">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground text-sm">Iniciando sesión...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
                <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 p-3 h-auto transition-colors"
                    onClick={() => handleLogin('google')}
                    disabled={isProcessingLogin}
                >
                    <GoogleIcon />
                    <span className="text-sm">Continuar con Google</span>
                </Button>
                 <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 p-3 h-auto transition-colors"
                    onClick={() => handleLogin('facebook')}
                    disabled={isProcessingLogin}
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
