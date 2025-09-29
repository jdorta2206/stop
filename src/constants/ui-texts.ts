
import { type Language } from '../contexts/language-context';

export const UI_TEXTS = {
  // Textos generales
  common: {
    loading: {
      es: "Cargando...",
      en: "Loading...",
      fr: "Chargement...",
      pt: "Carregando..."
    },
    error: {
      es: "Error",
      en: "Error",
      fr: "Erreur",
      pt: "Erro"
    },
    close: {
      es: "Cerrar",
      en: "Close",
      fr: "Fermer",
      pt: "Fechar"
    },
    cancel: {
      es: "Cancelar",
      en: "Cancel",
      fr: "Annuler",
      pt: "Cancelar"
    }
  },

  // Pantalla de inicio
  welcome: {
    title: {
      es: "¡Bienvenido a Stop!",
      en: "Welcome to Stop!",
      fr: "Bienvenue à Stop!",
      pt: "Bem-vindo ao Stop!"
    },
    description: { 
      es: "Desafía a la IA o juega con amigos", 
      en: "Challenge the AI or play with friends", 
      fr: "Défiez l'IA ou jouez avec des amis", 
      pt: "Desafie a IA ou jogue com amigos" 
    },
    playOptions: {
      es: "Elige cómo quieres jugar:",
      en: "Choose how you want to play:",
      fr: "Choisissez comment vous voulez jouer :",
      pt: "Escolha como você quer jogar:"
    }
  },

  // Salas y multijugador
  rooms: {
    create: {
      title: {
        es: "¡Sala Creada!",
        en: "Room Created!",
        fr: "Salle Créée !",
        pt: "Sala Criada!"
      },
      description: {
        es: "Comparte este ID con tus amigos. Al hacer clic en 'Ir a la Sala', serás llevado a la página de esta sala.",
        en: "Share this ID with your friends. Clicking 'Go to Room' will take you to a page for this room.",
        fr: "Partagez cet ID avec vos amis. En cliquant sur 'Aller à la Salle', vous serez dirigé vers une page pour cette salle.",
        pt: "Compartilhe este ID com seus amigos. Clicar em 'Ir para a Sala' o levará para uma página desta sala."
      }
    },
    join: {
      title: {
        es: "Unirse a una Sala",
        en: "Join a Room",
        fr: "Rejoindre une Salle",
        pt: "Entrar em uma Sala"
      },
      description: {
        es: "Ingresa el ID de la sala. Al unirte, serás llevado a una página para esta sala.",
        en: "Enter the Room ID. Upon joining, you'll be taken to a page for this room.",
        fr: "Entrez l'ID de la salle. En rejoignant, vous serez dirigé vers une page pour cette salle.",
        pt: "Digite o ID da sala. Ao entrar, você será levado para uma página desta sala."
      }
    },
    labels: {
      roomId: {
        es: "ID de Sala:",
        en: "Room ID:",
        fr: "ID de la Salle :",
        pt: "ID da Sala:"
      },
      roomIdPlaceholder: {
        es: "Ej: ABC123XYZ",
        en: "Ex: ABC123XYZ",
        fr: "Ex : ABC123XYZ",
        pt: "Ex: ABC123XYZ"
      },
      loading: {
        es: "Cargando sala {roomId}...",
        en: "Loading room {roomId}...",
        fr: "Chargement de la salle {roomId}...",
        pt: "Carregando sala {roomId}..."
      }
    },
    buttons: {
      copyId: {
        es: "Copiar ID",
        en: "Copy ID",
        fr: "Copier l'ID",
        pt: "Copiar ID"
      },
      goToRoom: {
        es: "Ir a la Sala",
        en: "Go to Room",
        fr: "Aller à la Salle",
        pt: "Ir para a Sala"
      },
      join: {
        es: "Unirse",
        en: "Join",
        fr: "Rejoindre",
        pt: "Entrar"
      },
      create: {
        es: "Crear Sala",
        en: "Create Room",
        fr: "Créer une Salle",
        pt: "Criar Sala"
      },
       leave: {
        es: "Salir de la Sala",
        en: "Leave Room",
        fr: "Quitter la Salle",
        pt: "Sair da Sala"
      },
      invite: {
        es: "Invitar",
        en: "Invite",
        fr: "Inviter",
        pt: "Convidar"
      }
    }
  },

  // Notificaciones (toasts)
  notifications: {
    idCopied: {
      title: {
        es: "¡ID de Sala Copiado!",
        en: "Room ID Copied!",
        fr: "ID de Salle Copié !",
        pt: "ID da Sala Copiado!"
      },
      description: {
        es: "El ID ha sido copiado. ¡Compártelo con tus amigos!",
        en: "The ID has been copied. Share it with your friends!",
        fr: "L'ID a été copié. Partagez-le avec vos amis !",
        pt: "O ID foi copiado. Compartilhe com seus amigos!"
      }
    },
    errorCopying: {
      title: {
        es: "Error al Copiar",
        en: "Error Copying",
        fr: "Erreur de Copie",
        pt: "Erro ao Copiar"
      },
      description: {
        es: "No se pudo copiar. Por favor, cópialo manualmente.",
        en: "Could not copy. Please copy it manually.",
        fr: "Impossible de copier. Veuillez le copier manuellement.",
        pt: "Não foi possível copiar. Por favor, copie manualmente."
      }
    },
     emptyRoomId: {
      title: {
        es: "ID de Sala Vacío",
        en: "Empty Room ID",
        fr: "ID de Salle Vide",
        pt: "ID da Sala Vazio"
      },
      description: {
        es: "Por favor, ingresa un ID de sala para unirte.",
        en: "Please enter a room ID to join.",
        fr: "Veuillez entrer un ID de salle pour rejoindre.",
        pt: "Por favor, insira um ID de sala para entrar."
      }
    },
    error: {
      title: {
        es: "Error",
        en: "Error",
        fr: "Erreur",
        pt: "Erro"
      },
      description: {
        es: "Ha ocurrido un error inesperado.",
        en: "An unexpected error occurred.",
        fr: "Une erreur inattendue s'est produite.",
        pt: "Ocorreu um erro inesperado."
      }
    },
    aiError: {
        title: {
            es: "Error de IA",
            en: "AI Error",
            fr: "Erreur IA",
            pt: "Erro de IA"
        },
        description: {
            es: "Error al generar respuesta para {category}",
            en: "Error generating response for {category}",
            fr: "Erreur lors de la génération de la réponse pour {category}",
            pt: "Erro ao gerar resposta para {category}"
        }
    },
     linkCopied: {
        title: {
          es: "¡Enlace copiado!",
          en: "Link copied!",
          fr: "Lien copié !",
          pt: "Link copiado!"
        },
        description: {
            es: "¡Enlace copiado al portapapeles!",
            en: "Link copied to clipboard!",
            fr: "Lien copié dans le presse-papiers !",
            pt: "Link copiado para a área de transferência!"
        }
    }
  },

  // Juego
  game: {
    title: { es: "Stop", en: "Stop", fr: "Stop", pt: "Stop" },
    logoAlt: { es: "Logo del juego Stop", en: "Stop Game Logo", fr: "Logo du jeu Stop", pt: "Logo do Jogo Stop" },
    playVsAI: { es: "Jugar contra IA", en: "Play against AI", fr: "Jouer contre l'IA", pt: "Jogar contra IA" },
    share: { es: "Compartir Juego", en: "Share Game", fr: "Partager le Jeu", pt: "Compartilhar Jogo" },
    shareMessage: { es: "¡Hey! ¡Juega Stop conmigo! Es muy divertido:", en: "Hey! Play Stop with me! It's great fun:", fr: "Salut ! Joue à Stop avec moi ! C'est très amusant :", pt: "Ei! Jogue Stop comigo! É muito divertido:" },
    letterLabel: { es: "Letra:", en: "Letter:", fr: "Lettre :", pt: "Letra:" },
    inputPlaceholder: { es: "Escribe aquí...", en: "Type here...", fr: "Écrivez ici...", pt: "Digite aqui..." },
    instructions: { es: "Completa las categorías con la letra seleccionada y presiona STOP.", en: "Fill the categories with the selected letter and press STOP.", fr: "Remplissez les catégories avec la lettre sélectionnée et appuyez sur STOP.", pt: "Preencha as categorias com a letra selecionada e pressione STOP." },
    instructionsRoom: { es: "Rellena los campos y espera a que el anfitrión termine la ronda.", en: "Fill in the fields and wait for the host to end the round.", fr: "Remplissez les champs et attendez que l'hôte termine la manche.", pt: "Preencha os campos e espere o anfitrião terminar a rodada." },
    loadingAI: {
        title: {
            es: "Procesando respuestas...",
            en: "Processing answers...",
            fr: "Traitement des réponses...",
            pt: "Processando respostas..."
        },
        thinking: {
            es: "IA está Pensando...",
            en: "AI is Thinking...",
            fr: "L'IA réfléchit...",
            pt: "IA está Pensando..."
        },
        validating: {
            es: "Validando respuestas...",
            en: "Validating answers...",
            fr: "Validation des réponses...",
            pt: "Validando respostas..."
        },
        scoring: {
            es: "Calculando puntos...",
            en: "Calculating scores...",
            fr: "Calcul des scores...",
            pt: "Calculando pontos..."
        },
        description: {
            es: "Por favor, espera mientras la IA prepara sus respuestas, validamos las tuyas y calculamos las puntuaciones.",
            en: "Please wait while the AI prepares its responses, we validate yours, and calculate the scores.",
            fr: "Veuillez patienter pendant que l'IA prépare ses réponses, que nous validons les vôtres et calculons les scores.",
            pt: "Por favor, aguarde enquanto a IA prepara suas respostas, validamos as suas e calculamos as pontuações."
        }
    },
    results: {
      title: {
        es: "Resultados",
        en: "Results",
        fr: "Résultats",
        pt: "Resultados"
      },
      winner: {
        player: {
          es: "¡Ganas la Ronda!",
          en: "You Win the Round!",
          fr: "Vous Gagnez la Manche !",
          pt: "Você Vence a Rodada!"
        },
        ai: {
          es: "¡IA Gana la Ronda!",
          en: "AI Wins the Round!",
          fr: "L'IA Gagne la Manche !",
          pt: "IA Vence a Rodada!"
        },
        tie: {
          es: "¡Empate en la Ronda!",
          en: "Round Tie!",
          fr: "Égalité dans la Manche !",
          pt: "Empate na Rodada!"
        },
        none: {
          es: "Nadie puntuó en esta ronda.",
          en: "Nobody scored this round.",
          fr: "Personne n'a marqué dans cette manche.",
          pt: "Ninguém pontuou nesta rodada."
        },
        label: {
            es: "Ganador: {winner}",
            en: "Winner: {winner}",
            fr: "Gagnant : {winner}",
            pt: "Vencedor: {winner}"
        }
      },
      scores: {
        player: {
          es: "Tu Puntuación (Ronda):",
          en: "Your Score (Round):",
          fr: "Votre Score (Manche) :",
          pt: "Sua Pontuação (Rodada):"
        },
        ai: {
          es: "Puntuación IA (Ronda):",
          en: "AI Score (Round):",
          fr: "Score IA (Manche) :",
          pt: "Pontuação IA (Rodada):"
        },
        total: {
          es: "Puntuación Total Acumulada",
          en: "Total Accumulated Score",
          fr: "Score Total Accumulé",
          pt: "Pontuação Total Acumulada"
        }
      },
       labels: {
        you: { es: "Tú", en: "You", fr: "Vous", pt: "Você" },
        ai: { es: "IA", en: "AI", fr: "IA", pt: "IA" },
        pointsSuffix: { es: "pts", en: "pts", fr: "pts", pt: "pts" }
      }
    },
    buttons: {
      nextRound: {
        es: "Jugar de nuevo",
        en: "Play Again",
        fr: "Rejouer",
        pt: "Jogar Novamente"
      },
      shareScore: {
        es: "Compartir Puntuación",
        en: "Share Score",
        fr: "Partager le Score",
        pt: "Compartilhar Pontuação"
      },
      stop: {
        es: "¡ALTO!",
        en: "STOP!",
        fr: "STOP !",
        pt: "PARE!"
      }
    },
    time: {
      left: {
        es: "Tiempo Restante:",
        en: "Time Left:",
        fr: "Temps Restant :",
        pt: "Tempo Restante:"
      },
      endingSoon: {
        es: "¡Solo 10 segundos!",
        en: "Only 10 seconds left!",
        fr: "Plus que 10 secondes !",
        pt: "Apenas 10 segundos!"
      },
      almostUp: {
        es: "¡5 segundos! ¡RÁPIDO!",
        en: "5 seconds! QUICK!",
        fr: "5 secondes ! VITE !",
        pt: "5 segundos! RÁPIDO!"
      },
      finalCountdown: {
        es: "¡3... 2... 1...!",
        en: "3... 2... 1...!",
        fr: "3... 2... 1... !",
        pt: "3... 2... 1...!"
      }
    }
  },

  // Chat
  chat: {
    title: { es: "Chat", en: "Chat", fr: "Chat", pt: "Chat" },
    loginRequired: {
      title: {
        es: "Inicia sesión",
        en: "Login Required",
        fr: "Connexion Requise",
        pt: "Login Necessário"
      },
      message: {
        es: "Debes iniciar sesión para chatear y participar plenamente.",
        en: "You must be logged in to chat and participate fully.",
        fr: "Vous devez être connecté pour discuter et participer pleinement.",
        pt: "Você precisa estar logado para conversar e participar plenamente."
      }
    },
    openLabel: {
      es: "Abrir chat",
      en: "Open chat",
      fr: "Ouvrir le chat",
      pt: "Abrir chat"
    },
    closeLabel: { es: "Cerrar chat", en: "Close chat", fr: "Fermer le chat", pt: "Fechar chat" },
    noMessages: { es: "No hay mensajes aún", en: "No messages yet", fr: "Pas encore de messages", pt: "Nenhuma mensagem ainda" },
    placeholder: { es: "Escribe un mensaje...", en: "Type a message...", fr: "Écrivez un message...", pt: "Digite uma mensagem..." },
    sendMessage: { es: "Enviar mensaje", en: "Send message", fr: "Envoyer le message", pt: "Enviar mensagem" },
    inputLabel: { es: "Entrada de mensaje", en: "Message input", fr: "Saisie de message", pt: "Entrada de mensagem" }
  },

  // Amigos y Social
  social: {
    inviteFriends: { es: "Invitar Amigos", en: "Invite Friends", fr: "Inviter des Amis", pt: "Convidar Amigos" },
    addFriend: {
      title: {
        es: "Añadir Amigo",
        en: "Add Friend",
        fr: "Ajouter un Ami",
        pt: "Adicionar Amigo"
      },
      placeholder: {
        es: "ID de amigo o email",
        en: "Friend's ID or email",
        fr: "ID ou email de l'ami",
        pt: "ID ou email do amigo"
      },
      button: {
        es: "Añadir",
        en: "Add",
        fr: "Ajouter",
        pt: "Adicionar"
      },
      success: {
        title: {
          es: "¡Amigo Añadido!",
          en: "Friend Added!",
          fr: "Ami Ajouté !",
          pt: "Amigo Adicionado!"
        },
        description: {
          es: "{name} ha sido añadido a tu lista local de amigos.",
          en: "{name} has been added to your local friends list.",
          fr: "{name} a été ajouté à votre liste d'amis locale.",
          pt: "{name} foi adicionado à sua lista local de amigos."
        }
      },
      error: {
        exists: {
          title: {
            es: "Amigo ya Existe",
            en: "Friend Already Exists",
            fr: "Ami Existe Déjà",
            pt: "Amigo Já Existe"
          },
          description: {
            es: "{name} ya está en tu lista de amigos.",
            en: "{name} is already on your friends list.",
            fr: "{name} est déjà dans votre liste d'amis.",
            pt: "{name} já está na sua lista de amigos."
          }
        },
        self: {
          title: {
            es: "No puedes agregarte",
            en: "Cannot add self",
            fr: "Ne peut pas s'ajouter",
            pt: "Não pode adicionar a si mesmo"
          },
          description: {
            es: "No puedes ser tu propio amigo.",
            en: "You cannot be your own friend.",
            fr: "Vous ne pouvez pas être votre propre ami.",
            pt: "Você não pode ser seu próprio amigo."
          }
        },
        empty: {
          title: {
            es: "Nombre/Email Vacío",
            en: "Empty Name/Email",
            fr: "Nom/Email Vide",
            pt: "Nome/Email Vazio"
          },
          description: {
            es: "Por favor, introduce un nombre o email.",
            en: "Please enter a name or email.",
            fr: "Veuillez entrer un nom ou un email.",
            pt: "Por favor, insira um nome ou email."
          }
        }
      }
    },
    challenge: {
        title: {
            es: "Desafiar",
            en: "Challenge",
            fr: "Défier",
            pt: "Desafiar"
        },
        comingSoon: {
            title: {
                es: "Desafío Próximamente",
                en: "Challenge Coming Soon",
                fr: "Défi Bientôt Disponible",
                pt: "Desafio Em Breve"
            },
            description: {
                es: "La funcionalidad para desafiar a '{name}' se añadirá en futuras actualizaciones.",
                en: "The feature to challenge '{name}' will be added in future updates.",
                fr: "La fonctionnalité pour défier '{name}' sera ajoutada en las futuras actualizaciones.",
                pt: "A funcionalidade para desafiar '{name}' será adicionada em futuras atualizações."
            }
        },
         setup: {
            title: {
                es: "Configurar Desafío",
                en: "Setup Challenge",
                fr: "Configurer le Défi",
                pt: "Configurar Desafio"
            },
            description: {
                es: "Preparando desafío con {playerName} (ID: {playerId}).",
                en: "Setting up challenge with {playerName} (ID: {playerId}).",
                fr: "Préparation du défi avec {playerName} (ID : {playerId}).",
                pt: "Preparando desafio com {playerName} (ID: {playerId})."
            },
            settingsComingSoon: {
                es: "Configuración del juego (próximamente)",
                en: "Game settings (coming soon)",
                fr: "Paramètres du jeu (bientôt disponible)",
                pt: "Configurações do jogo (em breve)"
            },
            sendComingSoon: {
                es: "Enviar desafío (próximamente)",
                en: "Send challenge (coming soon)",
                fr: "Envoyer le défi (bientôt disponible)",
                pt: "Enviar desafio (em breve)"
            }
        }
    },
    share: {
      score: {
        played: { es: "jugó", en: "played", fr: "a joué", pt: "jogou" },
        iJustPlayed: { es: "Acabo de jugar a", en: "I just played", fr: "Je viens de jouer à", pt: "Acabei de jogar" },
        myTotalScore: { es: "Mi puntuación total", en: "My total score", fr: "Mon score total", pt: "Minha pontuação total" },
        aiTotalScore: { es: "Puntuación total de la IA", en: "AI's total score", fr: "Score total de l'IA", pt: "Pontuação total da IA" },
        canYouBeatMe: { es: "¿Crees que puedes superarme? ¡Inténtalo en Stop!", en: "Think you can beat me? Try Stop!", fr: "Pensez-vous pouvoir me battre ? Essayez Stop !", pt: "Acha que pode me vencer? Experimente o Stop!" }
      },
      room: {
        title: {
          es: "Invitación a la Sala",
          en: "Room Invitation",
          fr: "Invitation à la Salle",
          pt: "Convite para a Sala"
        },
        text: {
          es: "¡Únete a mi sala en Stop! Código: {roomCode}",
          en: "Join my room in Stop! Code: {roomCode}",
          fr: "Rejoins ma salle dans Stop ! Code : {roomCode}",
          pt: "Junte-se à minha sala no Stop! Código: {roomCode}"
        },
        invite: {
            es: "¡Únete a mi sala en Global Stop! ID: {roomUrl}",
            en: "Join my room in Global Stop! ID: {roomUrl}",
            fr: "Rejoins ma salle sur Global Stop ! ID : {roomUrl}",
            pt: "Entre na minha sala no Global Stop! ID: {roomUrl}"
        },
        copyLink: {
            es: "Copiar Enlace de la Sala",
            en: "Copy Room Link",
            fr: "Copier le Lien de la Salle",
            pt: "Copiar Link da Sala"
        },
        copied: {
            title: {
                es: "¡Enlace Copiado!",
                en: "Link Copied!",
                fr: "Lien Copié !",
                pt: "Link Copiado!"
            },
            description: {
                es: "El enlace a la sala ha sido copiado a tu portapapeles.",
                en: "The room link has been copied to your clipboard.",
                fr: "Le lien de la salle a été copié dans votre presse-papiers.",
                pt: "O link da sala foi copiado para sua área de transferência."
            }
        }
      },
      whatsapp: { es: 'Compartir en WhatsApp', en: 'Share on WhatsApp', fr: 'Partager sur WhatsApp', pt: 'Compartilhar no WhatsApp' },
      facebook: { es: 'Compartir en Facebook', en: 'Share on Facebook', fr: 'Partager sur Facebook', pt: 'Compartilhar no Facebook' }
    }
  },
  
  leaderboards: {
      global: {
          title: { es: "Ranking Global", en: "Global Ranking", fr: "Classement Mondial", pt: "Ranking Global" },
          description: { es: "Los mejores jugadores de todo el mundo.", en: "The best players from around the world.", fr: "Les meilleurs joueurs du monde entier.", pt: "Os melhores jogadores de todo o mundo." }
      },
      friends: {
          title: { es: "Puntuación de Amigos", en: "Friends Scores", fr: "Scores des Amis", pt: "Pontuações dos Amigos" },
          description: { es: "Compite con tus amigos y mira quién lidera.", en: "Compete with your friends and see who's on top.", fr: "Rivalisez avec vos amis et voyez qui est en tête.", pt: "Compita com seus amigos e veja quem está na frente." },
          comingSoon: { es: "Próximamente: Amigos sincronizados desde la base de datos.", en: "Coming soon: Friends synced from the database.", fr: "Bientôt : Amis synchronisés depuis la base de données.", pt: "Em breve: Amigos sincronizados do banco de dados." }
      },
      personalHighScore: {
          title: { es: "Tu Puntuación Más Alta", en: "Your Personal High Score", fr: "Votre Meilleur Score Personnel", pt: "Sua Pontuação Mais Alta" },
          subtitle: { es: "¡Sigue jugando para superarla!", en: "Keep playing to beat it!", fr: "Continuez à jouer pour le battre !", pt: "Continue jogando para superá-la!" }
      },
      title: { es: "Ranking & Amigos", en: "Leaderboard & Friends", fr: "Classement & Amis", pt: "Ranking & Amigos" },
      globalLeaderboard: { es: "Ranking Global", en: "Global Leaderboard", fr: "Classement Global", pt: "Ranking Global" },
      personalStats: { es: "Estadísticas Personales", en: "Personal Stats", fr: "Statistiques Personnelles", pt: "Estatísticas Pessoais" },
      achievements: { es: "Logros", en: "Achievements", fr: "Succès", pt: "Conquistas" },
      rank: { es: "Pos.", en: "Rank", fr: "Rang", pt: "Pos." },
      player: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
      score: { es: "Puntos", en: "Score", fr: "Score", pt: "Pontos" },
      games: { es: "Partidas", en: "Games", fr: "Parties", pt: "Jogos" },
      winRate: { es: "% Victorias", en: "Win Rate", fr: "% Victoires", pt: "% Vitórias" },
      level: { es: "Nivel", en: "Level", fr: "Niveau", pt: "Nível" },
      you: { es: "(Tú)", en: "You", fr: "(Vous)", pt: "(Você)" },
      totalGames: { es: "Total de Partidas", en: "Total Games", fr: "Total des Parties", pt: "Total de Jogos" },
      activeUsers: { es: "Usuarios Activos", en: "Active Users", fr: "Utilisateurs Actifs", pt: "Usuários Ativos" },
      highestScore: { es: "Puntuación Más Alta", en: "Highest Score", fr: "Score le Plus Élevé", pt: "Maior Pontuação" },
      yourPosition: { es: "Tu Posición", en: "Your Position", fr: "Votre Position", pt: "Sua Posição" },
      totalScore: { es: "puntuación total", en: "total score", fr: "score total", pt: "pontuação total" },
      bestScore: { es: "mejor puntuación", en: "best score", fr: "meilleur score", pt: "melhor pontuação" },
      averageScore: { es: "promedio por partida", en: "average per game", fr: "moyenne par partie", pt: "média por jogo" },
      gamesPlayed: { es: "partidas jugadas", en: "games played", fr: "parties jouées", pt: "jogos jogados" },
      recentGames: { es: "Partidas Recientes", en: "Recent Games", fr: "Parties Récentes", pt: "Jogos Recentes" },
      noGames: { es: "No has jugado partidas aún", en: "You haven't played any games yet", fr: "Vous n'avez pas encore joué", pt: "Você ainda não jogou" },
      playNow: { es: "¡Jugar Ahora!", en: "Play Now!", fr: "Jouer Maintenant!", pt: "Jogar Agora!" },
      shareGame: { es: "Compartir Juego", en: "Share Game", fr: "Partager le Jeu", pt: "Compartilhar Jogo" },
      backToGame: { es: "Volver al Juego", en: "Back to Game", fr: "Retour au Jeu", pt: "Voltar ao Jogo" },
      mustLogin: { es: "Debes iniciar sesión para ver el ranking completo", en: "You must log in to view full leaderboard", fr: "Vous devez vous connecter pour voir le classement complet", pt: "Você deve fazer login para ver o ranking completo" },
      loginButton: { es: "Iniciar Sesión", en: "Sign In", fr: "Se Connecter", pt: "Entrar" },
      lastPlayed: { es: "Última vez:", en: "Last played:", fr: "Dernier jeu:", pt: "Último jogo:" },
      never: { es: "Nunca", en: "Never", fr: "Jamais", pt: "Nunca" },
      today: { es: "Hoy", en: "Today", fr: "Aujourd'hui", pt: "Hoje" },
      yesterday: { es: "Ayer", en: "Yesterday", fr: "Hier", pt: "Ontem" },
      daysAgo: { es: "hace {days} días", en: "{days} días ago", fr: "il y a {days} jours", pt: "há {days} dias" },
      shareText: { es: "¡Ven a jugar Stop conmigo! 🎮 Compite en el ranking y demuestra tu vocabulario 🧠", en: "Come play Stop with me! 🎮 Compete in the leaderboard and show your vocabulary 🧠", fr: "Viens jouer à Stop avec moi ! 🎮 Rivalise dans le classement et montre ton vocabulaire 🧠", pt: "Venha jogar Stop comigo! 🎮 Compita no ranking e mostre seu vocabulário 🧠" },
      players: { es: "jugadores", en: "players", fr: "joueurs", pt: "jogadores" },
      noRankings: { es: "No hay rankings disponibles", en: "No rankings available", fr: "Aucun classement disponible", pt: "Nenhum ranking disponível" },
      beTheFirst: { es: "¡Sé el primero en jugar y aparecer en la tabla de clasificación!", en: "Be the first to play and appear on the leaderboard!", fr: "Soyez le premier à jouer et à apparaître au classement !", pt: "Seja o primeiro a jogar e aparecer no ranking!" },
      more: { es: "más", en: "more", fr: "plus", pt: "mais" },
      best: { es: "mejor", en: "best", fr: "meilleur", pt: "melhor" },
      playToSeeStats: { es: "¡Comienza a jugar para ver tus estadísticas!", en: "Start playing to see your stats!", fr: "Commencez à jouer pour voir vos statistiques !", pt: "Comece a jogar para ver suas estatísticas!" },
      letter: { es: "Letra", en: "Letter", fr: "Lettre", pt: "Letra" },
      points: { es: "puntos", en: "points", fr: "points", pt: "pontos" },
      excellent: { es: "Excelente", en: "Excellent", fr: "Excellent", pt: "Excelente" },
      good: { es: "Bueno", en: "Good", fr: "Bien", pt: "Bom" },
      regular: { es: "Regular", en: "Regular", fr: "Régulier", pt: "Regular" },
      noAchievements: { es: "Sin logros aún", en: "No achievements yet", fr: "Aucun succès pour le moment", pt: "Nenhuma conquista ainda" },
      playToUnlock: { es: "¡Juega más partidas para desbloquear logros!", en: "Play more games to unlock achievements!", fr: "Jouez plus de parties pour débloquer des succès !", pt: "Jogue mais para desbloquear conquistas!" },
      playedOnPlatform: { es: "Jugadas en la plataforma", en: "Played on the platform", fr: "Jouées sur la plateforme", pt: "Jogados na plataforma" },
      last7Days: { es: "En los últimos 7 días", en: "In the last 7 days", fr: "Au cours des 7 derniers jours", pt: "Nos últimos 7 dias" },
      currentRecord: { es: "Récord actual", en: "Current record", fr: "Record actuel", pt: "Recorde atual" },
  },

  // Lobby
  lobby: {
    title: {
      es: "Sala de Espera Multijugador",
      en: "Multiplayer Lobby",
      fr: "Salon Multijoueur",
      pt: "Lobby Multijogador"
    },
    inRoom: {
      es: "Estás en la Sala:",
      en: "You are in Room:",
      fr: "Vous êtes dans la Salle :",
      pt: "Você está na Sala:"
    },
    waiting: {
      es: "Esperando a otros jugadores... Comparte el ID de la sala.",
      en: "Waiting for other players... Share the room ID.",
      fr: "En attente d'autres joueurs... Partagez l'ID de la salle.",
      pt: "Aguardando outros jogadores... Compartilhe o ID da sala."
    },
    players: {
        title: {
            es: "Jugadores en la Sala",
            en: "Players in Room",
            fr: "Joueurs dans la Salle",
            pt: "Jogadores na Sala"
        },
        description: {
            es: "Los jugadores conectados a Stop aparecerán aquí. El estado en línea se actualiza en tiempo real desde Firebase.",
            en: "Connected players will appear here. Online status updates in real-time from Firebase.",
            fr: "Les joueurs connectés apparaîtront ici. Le statut en ligne est mis à jour en temps réel depuis Firebase.",
            pt: "Jogadores conectados aparecerão aqui. O status online atualiza em tempo real do Firebase."
        },
        online: { es: "Jugando Stop", en: "Playing Stop", fr: "Jouant à Stop", pt: "Jogando Stop" },
        offline: { es: "Desconectado", en: "Offline", fr: "Hors ligne", pt: "Offline" },
    }
  },

  // Host
  host: {
    label: {
      es: "Anfitrión",
      en: "Host",
      fr: "Hôte",
      pt: "Anfitrião"
    },
    messages: {
      willBe: {
        es: "Serás el anfitrión al iniciar la partida.",
        en: "You will be the host when starting the game.",
        fr: "Vous serez l'hôte au démarrage de la partie.",
        pt: "Você será o anfitrião ao iniciar o jogo."
      },
      is: {
        es: "Eres el anfitrión. ¡Puedes iniciar la partida!",
        en: "You are the host. You can start the game!",
        fr: "Vous êtes l'hôte. Vous pouvez démarrer la partie !",
        pt: "Você é o anfitrião. Pode iniciar o jogo!"
      },
      onlyHost: {
        start: {
          es: "Solo el anfitrión puede iniciar la partida.",
          en: "Only the host can start the game.",
          fr: "Seul l'hôte peut démarrer la partie.",
          pt: "Apenas o anfitrião pode iniciar o jogo."
        },
        evaluate: {
          es: "Solo el anfitrión puede evaluar la ronda.",
          en: "Only the host can evaluate the round.",
          fr: "Seul l'hôte peut évaluer la manche.",
          pt: "Apenas o anfitrião pode avaliar a rodada."
        }
      }
    },
    startGame: {
        button: {
            es: "Iniciar Partida (Amigos) - Próximamente",
            en: "Start Game (Friends) - Coming Soon",
            fr: "Démarrer la Partie (Amis) - Bientôt Disponible",
            pt: "Iniciar Jogo (Amigos) - Em Breve"
        },
        description: {
            es: "La funcionalidad para iniciar una partida multijugador real con otros jugadores en esta sala se añadirá en futuras actualizaciones.",
            en: "The functionality to start a real multiplayer game with other players in this room will be added in future updates.",
            fr: "La fonctionnalité pour démarrer une vraie partie multijoueur avec d'autres joueurs dans cette salle sera ajoutée dans les futures mises à jour.",
            pt: "A funcionalidade para iniciar um jogo multijogador real com outros jogadores nesta sala será adicionada em futuras atualizações."
        }
    }
  },

  // Validación de palabras
  validation: {
    valid: {
      es: "Válido",
      en: "Valid",
      fr: "Valide",
      pt: "Válido"
    },
    errors: {
      format: {
        es: "Formato Incorrecto",
        en: "Incorrect Format",
        fr: "Format Incorrect",
        pt: "Formato Incorreto"
      },
      invalid: {
        es: "Palabra Inválida",
        en: "Invalid Word",
        fr: "Mot Invalide",
        pt: "Palavra Inválida"
      },
      title: {
        es: "Error de Validación",
        en: "Validation Error",
        fr: "Erreur de Validation",
        pt: "Erro de Validação"
      },
      description: {
        es: "No se pudo validar la palabra '{word}' para la categoría {category}.",
        en: "Could not validate the word '{word}' for category {category}.",
        fr: "Impossible de valider le mot '{word}' pour la catégorie {category}.",
        pt: "Não foi possível validar la palavra '{word}' para a categoria {category}."
      }
    }
  },
  
  // General
  youSuffix: { es: "(Tú)", en: "(You)", fr: "(Vous)", pt: "(Você)" },
  home: { es: "Volver al inicio", en: "Back to Home", fr: "Retour à l'accueil", pt: "Voltar ao Início" },
  language: { es: "Idioma", en: "Language", fr: "Langue", pt: "Idioma" },
  user: {
      loggedInAs: { es: "Conectado como: {name}", en: "Logged in as: {name}", fr: "Connecté en tant que : {name}", pt: "Conectado como: {name}" },
      defaultName: { es: "Jugador", en: "Player", fr: "Joueur", pt: "Jogador" },
  },
  // Página de Categorías
  categories: {
    title: {
      es: "Categorías del Juego",
      en: "Game Categories",
      fr: "Catégories de jeu",
      pt: "Categorias de Jogo"
    },
    list: {
      place: { es: "Lugar", en: "Place", fr: "Lieu", pt: "Lugar" },
      animal: { es: "Animal", en: "Animal", fr: "Animal", pt: "Animal" },
      name: { es: "Nombre", en: "Name", fr: "Nom", pt: "Nome" },
      food: { es: "Comida", en: "Food", fr: "Nourriture", pt: "Comida" },
      color: { es: "Color", en: "Color", fr: "Couleur", pt: "Cor" },
      object: { es: "Objeto", en: "Object", fr: "Objet", pt: "Objeto" },
      brand: { es: "Marca", en: "Brand", fr: "Marque", pt: "Marca" }
    },
    whyPlay: {
      title: {
        es: "¿Por qué jugar Stop?",
        en: "Why play Stop?",
        fr: "Pourquoi jouer à Stop?",
        pt: "Por que jogar Stop?"
      },
      features: {
        multiplayer: {
          title: { es: "Multijugador", en: "Multiplayer", fr: "Multijoueur", pt: "Multijogador" },
          description: { es: "Juega con hasta 10 amigos simultáneamente", en: "Play with up to 10 friends simultaneously", fr: "Jouez avec jusqu'à 10 amis simultanément", pt: "Jogue com até 10 amigos simultaneamente" }
        },
        multipleCategories: {
          title: { es: "Múltiples Categorías", en: "Multiple Categories", fr: "Catégories Multiples", pt: "Múltiplas Categorias" },
          description: { es: "Más de 10 categorías para desafiar tu mente", en: "Over 10 categories to challenge your mind", fr: "Plus de 10 catégories pour défier votre esprit", pt: "Mais de 10 categorias para desafiar sua mente" }
        },
        scoringSystem: {
          title: { es: "Sistema de Puntuación", en: "Scoring System", fr: "Système de Notation", pt: "Sistema de Pontuação" },
          description: { es: "Puntuación justa con validación automática", en: "Fair scoring with automatic validation", fr: "Notation équitable avec validation automatique", pt: "Pontuação justa com validação automática" }
        },
        free: {
          title: { es: "Completamente Gratuito", en: "Completely Free", fr: "Entièrement Gratuit", pt: "Totalmente Gratuito" },
          description: { es: "Sin anuncios, sin compras, solo diversión", en: "No ads, no purchases, just fun", fr: "Pas de publicité, pas d'achats, juste du plaisir", pt: "Sem anúncios, sem compras, apenas diversão" }
        }
      }
    },
    howToPlay: {
      title: {
        es: "¿Cómo Jugar?",
        en: "How to Play?",
        fr: "Comment jouer?",
        pt: "Como Jogar?"
      },
      step: { es: "Paso", en: "Step", fr: "Étape", pt: "Passo" },
      steps: {
        step1: { es: "Se genera una letra aleatoria", en: "A random letter is generated", fr: "Une lettre aléatoire est générée", pt: "Uma letra aleatória é gerada" },
        step2: { es: "Escribe palabras que empiecen con esa letra", en: "Write words starting with that letter", fr: "Écrivez des mots commençant par cette lettre", pt: "Escreva palavras que comecem com essa letra" },
        step3: { es: "Completa todas las categorías", en: "Complete all categories", fr: "Complétez toutes les catégories", pt: "Complete todas as categorias" },
        step4: { es: "¡Presiona STOP cuando termines!", en: "Press STOP when you finish!", fr: "Appuyez sur STOP lorsque vous avez terminé!", pt: "Pressione STOP quando terminar!" }
      }
    }
  },
   notFound: {
    title: {
      es: "Página no encontrada",
      en: "Page not found",
      fr: "Page non trouvée",
      pt: "Página não encontrada"
    },
    button: {
      es: "Volver al inicio",
      en: "Back to home",
      fr: "Retour à l'accueil",
      pt: "Voltar ao início"
    }
  },
  auth: {
    signIn: { es: "Acceder", en: "Sign In", fr: "Se connecter", pt: "Entrar" },
    signOut: { es: "Salir", en: "Sign Out", fr: "Se déconnecter", pt: "Sair" }
  },
  landing: {
    title: { es: "Stop", en: "Stop", fr: "Stop", pt: "Stop" },
    subtitle: { es: "El juego de palabras más divertido", en: "The most fun word game", fr: "Le jeu de mots le plus amusant", pt: "O jogo de palavras mais divertido" },
    description: { es: "Pon a prueba tu agilidad mental y tu vocabulario. Gira la ruleta para obtener una letra y completa todas las categorías antes de que se acabe el tiempo o alguien más presione ¡STOP!", en: "Test your mental agility and vocabulary. Spin the wheel for a letter and fill all categories before time runs out or someone else hits STOP!", fr: "Testez votre agilité mentale et votre vocabulaire. Tournez la roue pour obtenir une lettre et remplissez toutes les catégories avant la fin du temps ou que quelqu'un d'autre n'appuie sur STOP !", pt: "Teste sua agilidade mental e seu vocabulário. Gire a roleta para obter uma letra e preencha todas as categorias antes que o tempo acabe ou que outra pessoa pressione STOP!" },
    playNow: { es: "Jugar Ahora", en: "Play Now", fr: "Jouer Maintenant", pt: "Jogar Agora" },
    privateRoom: { es: "Sala Privada", en: "Private Room", fr: "Salle Privée", pt: "Sala Privada" },
    ranking: { es: "Ranking", en: "Ranking", fr: "Classement", pt: "Ranking" },
    footer: { es: "© 2024 Stop Game. Creado con ❤️ para los amantes de las palabras.", en: "© 2024 Stop Game. Made with ❤️ for word lovers.", fr: "© 2024 Stop Game. Fait avec ❤️ pour les amoureux des mots.", pt: "© 2024 Stop Game. Feito com ❤️ para os amantes de palavras." }
  }
};
// Tipo para TypeScript
export type UITexts = typeof UI_TEXTS;
