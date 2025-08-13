
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, Search, X, Plus, Phone, MessageSquare, BookUser } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
}

interface ContactsManagerProps {
  language: 'es' | 'en' | 'fr' | 'pt';
  roomCode: string;
  onClose: () => void;
}

const content = {
  es: {
    title: 'Invitar Contactos',
    search: 'Buscar contactos',
    noResults: 'No se encontraron contactos',
    inviteVia: 'Invitar vía',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    inviteMessage: '¡Únete a mi partida de STOP! Usa el código',
    close: 'Cerrar',
    myContacts: 'Mis Contactos',
    searchContacts: 'Buscar por nombre o teléfono',
    inviteSent: 'Invitación enviada',
    inviteAll: 'Invitar a todos',
    featureComingSoon: 'Próximamente: Accede a tus contactos',
    featureDescription: 'Esta función te permitirá invitar directamente a los contactos de tu teléfono. ¡Estamos trabajando en ello!'
  },
  en: {
    title: 'Invite Contacts',
    search: 'Search contacts',
    noResults: 'No contacts found',
    inviteVia: 'Invite via',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    inviteMessage: 'Join my STOP game! Use the code',
    close: 'Close',
    myContacts: 'My Contacts',
    searchContacts: 'Search by name or phone',
    inviteSent: 'Invitation sent',
    inviteAll: 'Invite all',
    featureComingSoon: 'Coming Soon: Access Your Contacts',
    featureDescription: 'This feature will allow you to directly invite contacts from your phone. We are working on it!'
  },
  fr: {
    title: 'Inviter des Contacts',
    search: 'Rechercher des contacts',
    noResults: 'Aucun contact trouvé',
    inviteVia: 'Inviter via',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    inviteMessage: 'Rejoins ma partie de STOP! Utilise le code',
    close: 'Fermer',
    myContacts: 'Mes Contacts',
    searchContacts: 'Rechercher par nom ou téléphone',
    inviteSent: 'Invitation envoyée',
    inviteAll: 'Inviter tous',
    featureComingSoon: 'Bientôt: Accédez à vos contacts',
    featureDescription: 'Cette fonctionnalité vous permettra d\'inviter directement des contacts de votre téléphone. Nous y travaillons !'
  },
  pt: {
    title: 'Convidar Contatos',
    search: 'Pesquisar contatos',
    noResults: 'Nenhum contato encontrado',
    inviteVia: 'Convidar via',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    inviteMessage: 'Entre no meu jogo STOP! Use o código',
    close: 'Fechar',
    myContacts: 'Meus Contatos',
    searchContacts: 'Pesquisar por nome ou telefone',
    inviteSent: 'Convite enviado',
    inviteAll: 'Convidar todos',
    featureComingSoon: 'Em breve: Acesse seus contatos',
    featureDescription: 'Este recurso permitirá que você convide contatos diretamente do seu telefone. Estamos trabalhando nisso!'
  }
};

export default function ContactsManager({ language, roomCode, onClose }: ContactsManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasPermission, setHasPermission] = useState(false);

  const t = content[language];

  const requestContactsPermission = async () => {
    // La API de Contactos solo funciona en contextos seguros (HTTPS)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = {multiple: true};
        // La siguiente línea es donde se solicitaría el permiso real.
        // Por ahora, solo simularemos que se ha denegado.
        // const contacts = await (navigator as any).contacts.select(props, opts);
        // setHasPermission(true);
        alert('La API de Contactos aún no está implementada en esta demo.');
      } catch (ex) {
        setHasPermission(false);
      }
    } else {
        alert('Tu navegador no soporta la API de Contactos.');
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white w-full max-w-md max-h-[80vh] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <h3 className="font-bold text-xl">{t.title}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white">
          <X size={20} />
        </Button>
      </CardHeader>
      
      <CardContent className="overflow-y-auto flex-grow flex flex-col justify-center items-center text-center">
        <BookUser className="h-20 w-20 text-white/50 mb-4" />
        <h4 className="text-lg font-bold text-white mb-2">{t.featureComingSoon}</h4>
        <p className="text-white/70 max-w-xs">{t.featureDescription}</p>
         <Button 
            variant="outline" 
            className="mt-6 bg-white/20 border-white/40 hover:bg-white/30"
            onClick={requestContactsPermission}
          >
            Solicitar Permiso (Demo)
          </Button>
      </CardContent>
    </Card>
  );
}
