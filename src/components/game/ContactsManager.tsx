
import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Users, Search, X, Plus, Phone, MessageSquare, BookUser, Check } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

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
    search: 'Buscar contactos...',
    noResults: 'No se encontraron contactos',
    inviteVia: 'Invitar vía',
    whatsapp: 'WhatsApp',
    sms: 'SMS',
    inviteMessage: '¡Únete a mi partida de STOP! Usa el código:',
    close: 'Cerrar',
    myContacts: 'Mis Contactos',
    searchContacts: 'Buscar por nombre o teléfono',
    inviteSent: 'Invitación enviada',
    inviteAll: 'Invitar a todos',
    featureComingSoon: 'Accede a tus contactos',
    featureDescription: 'Permite que el juego acceda a tus contactos para enviar invitaciones fácilmente.',
    accessButton: 'Permitir Acceso',
    browserNotSupported: 'Tu navegador no soporta esta función.',
    errorLoading: 'No se pudieron cargar los contactos.',
    noPermission: 'Permiso denegado. No podemos acceder a tus contactos.'
  },
  en: {
    title: 'Invite Contacts',
    search: 'Search contacts...',
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
    featureComingSoon: 'Access Your Contacts',
    featureDescription: 'Allow the game to access your contacts to easily send invitations.',
    accessButton: 'Allow Access',
    browserNotSupported: 'Your browser does not support this feature.',
    errorLoading: 'Could not load contacts.',
    noPermission: 'Permission denied. We cannot access your contacts.'
  },
  fr: {
    title: 'Inviter des Contacts',
    search: 'Rechercher des contacts...',
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
    featureComingSoon: 'Accédez à vos contacts',
    featureDescription: 'Autorisez le jeu à accéder à vos contacts pour envoyer facilement des invitations.',
    accessButton: 'Autoriser l\'accès',
    browserNotSupported: 'Votre navigateur ne prend pas en charge cette fonctionnalité.',
    errorLoading: 'Impossible de charger les contacts.',
    noPermission: 'Permission refusée. Nous ne pouvons pas accéder à vos contacts.'
  },
  pt: {
    title: 'Convidar Contatos',
    search: 'Pesquisar contatos...',
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
    featureComingSoon: 'Acesse seus contatos',
    featureDescription: 'Permita que o jogo acesse seus contatos para enviar convites facilmente.',
    accessButton: 'Permitir Acesso',
    browserNotSupported: 'Seu navegador não suporta este recurso.',
    errorLoading: 'Não foi possível carregar os contatos.',
    noPermission: 'Permissão negada. Não podemos acessar seus contatos.'
  }
};

export default function ContactsManager({ language, roomCode, onClose }: ContactsManagerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [hasPermission, setHasPermission] = useState(false);
  
  const t = content[language];

  const requestContactsPermission = async () => {
    // La API de Contactos solo funciona en contextos seguros (HTTPS)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'icon'];
        const opts = { multiple: true };
        const selected = await (navigator as any).contacts.select(props, opts);
        
        if(selected.length > 0) {
            const mappedContacts: Contact[] = selected.map((c: any) => ({
                id: c.tel[0] || c.name[0],
                name: c.name[0],
                phone: c.tel[0],
                avatarUrl: c.icon?.length ? URL.createObjectURL(c.icon[0]) : undefined
            }));
            setContacts(mappedContacts);
            setHasPermission(true);
        }
      } catch (ex) {
        setHasPermission(false);
        toast({ title: t.errorLoading, variant: 'destructive'});
      }
    } else {
        toast({ title: t.browserNotSupported, variant: 'destructive'});
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(contactId)) {
        newSelection.delete(contactId);
      } else {
        newSelection.add(contactId);
      }
      return newSelection;
    });
  };

  const sendInvite = (platform: 'whatsapp' | 'sms') => {
    const message = encodeURIComponent(`${t.inviteMessage} ${roomCode}`);
    const selectedPhones = Array.from(selectedContacts).map(id => contacts.find(c => c.id === id)?.phone).filter(Boolean);
    
    if (selectedPhones.length === 0) return;

    // Para SMS, el estándar es un poco diferente entre plataformas
    const phoneList = selectedPhones.join(',');
    
    let url = '';
    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${message}`;
    } else {
       url = `sms:${phoneList}?&body=${message}`;
    }
    
    window.open(url, '_blank');
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery)
    );
  }, [contacts, searchQuery]);

  const renderContent = () => {
    if (!hasPermission) {
      return (
        <div className="flex flex-col justify-center items-center text-center h-full">
            <BookUser className="h-20 w-20 text-white/50 mb-4" />
            <h4 className="text-lg font-bold text-white mb-2">{t.featureComingSoon}</h4>
            <p className="text-white/70 max-w-xs mb-6">{t.featureDescription}</p>
            <Button onClick={requestContactsPermission}>{t.accessButton}</Button>
        </div>
      );
    }
    
    return (
        <>
            <div className="px-4 pt-2 pb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder={t.search} 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
            <CardContent className="overflow-y-auto flex-grow p-4 space-y-2">
                {filteredContacts.length > 0 ? filteredContacts.map(contact => (
                    <div 
                        key={contact.id} 
                        onClick={() => handleSelectContact(contact.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedContacts.has(contact.id) ? 'bg-white/30' : 'hover:bg-white/10'}`}
                    >
                        <Avatar>
                            <AvatarImage src={contact.avatarUrl} />
                            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{contact.name}</p>
                            <p className="text-xs text-white/70">{contact.phone}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedContacts.has(contact.id) ? 'bg-green-500 border-green-400' : 'border-white/50'}`}>
                            {selectedContacts.has(contact.id) && <Check className="h-4 w-4 text-white" />}
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-white/70 py-8">{t.noResults}</p>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                <Button className="flex-1" onClick={() => sendInvite('whatsapp')} disabled={selectedContacts.size === 0}>
                    <MessageSquare className="mr-2 h-4 w-4" /> {t.whatsapp}
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => sendInvite('sms')} disabled={selectedContacts.size === 0}>
                    <Phone className="mr-2 h-4 w-4" /> {t.sms}
                </Button>
            </CardFooter>
        </>
    )
  }

  return (
    <Card className="bg-black/50 backdrop-blur-lg border-white/20 text-white w-full max-w-md h-[70vh] flex flex-col shadow-2xl rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Users size={20} />
          <h3 className="font-bold text-xl">{t.title}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full">
          <X size={20} />
        </Button>
      </CardHeader>
      
      {renderContent()}
      
    </Card>
  );
}

