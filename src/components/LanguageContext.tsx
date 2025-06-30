import { createContext, useContext, ReactNode } from "react";

type Language = "fr";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, ...args: string[]) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const language: Language = "fr";

  const setLanguage = (_language: Language) => {
    // No-op: Language switching is disabled
  };

  // French translations
  const translations: { [key: string]: string } = {
    // Navigation et authentification
    welcome: "Bienvenue",
    login: "Connexion",
    register: "S'inscrire",
    logout: "Se déconnecter",

    // Interface principale
    messages: "Messages",
    settings: "Paramètres",
    profile: "Profil",
    search: "Rechercher",
    bookmarks: "Favoris",
    gallery: "Galerie",
    home: "Accueil",

    // Actions
    filter: "Filtrer",
    view: "Voir",
    download: "Télécharger",
    share: "Partager",
    save: "Sauvegarder",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",

    // Paramètres
    security: "Sécurité",
    privacy: "Confidentialité",
    notifications: "Notifications",
    theme: "Thème",
    language: "Langue",
    help: "Aide",
    account: "Compte",
    appearance: "Apparence",
    support: "Support",

    // Messages d'état
    noResults: "Aucun résultat trouvé",
    noBookmarks: "Aucun favori pour le moment",
    noMedia: "Aucun média partagé",

    // Landing page
    newPlatform: "🎉 Nouvelle plateforme de communication",
    connectWith: "Connectez-vous avec",
    theWorld: "le monde entier",
    landingDescription:
      "Découvrez une nouvelle façon de communiquer, de rencontrer des personnes et de créer des liens authentiques dans un environnement sécurisé et bienveillant.",
    startFree: "Commencer Gratuitement",
    learnMore: "En Savoir Plus",

    // Features
    instantMessaging: "Messagerie Instantanée",
    instantMessagingDesc:
      "Chattez en temps réel avec vos amis et rencontrez de nouvelles personnes",
    chatRooms: "Salles de Discussion",
    chatRoomsDesc: "Rejoignez des groupes selon vos centres d'intérêt",
    authenticConnections: "Rencontres Authentiques",
    authenticConnectionsDesc:
      "Trouvez l'amour ou de nouveaux amis en toute sécurité",
    guaranteedSecurity: "Sécurité Garantie",
    guaranteedSecurityDesc: "Votre vie privée et sécurité sont nos priorités",

    // Stats
    activeUsers: "Utilisateurs Actifs",
    messagesSent: "Messages Envoyés",
    successfulMeetings: "Rencontres Réussies",
    recentActivity: "Activité récente",
    live: "En direct",
    joinedRoomFriends: "a rejoint la salle Amis",
    sharedPhoto: "a partagé une photo",
    startedVideoCall: "a démarré un appel vidéo",
    sentVoiceMessage: "a envoyé un message vocal",
    minutesAgo: "il y a %d min",
    // Mocked user names removed to ensure frontend is data-empty
    online: "En ligne",
    offline: "Hors ligne",
    away: "Absent",
    busy: "Occupé",
    blocked: "Utilisateur bloqué",
    writeMessage: "Écrire un message...",
    userBlockedMessage:
      "Vous avez bloqué cet utilisateur. Débloquez-le pour pouvoir envoyer des messages.",
    cannotSendMessage: "Impossible d'envoyer des messages pour le moment.",
    fileError: "Erreur de fichier",
    fileSizeError: "Les fichiers ne doivent pas dépasser 20 MB",
    videoDurationError: "Les vidéos ne doivent pas dépasser 2 minutes",
    // Mocked chat messages removed to ensure frontend is data-empty
    mediaSection: "Médias",
    linkSection: "Lien",
    files: "Fichiers",
    seeAll: "Voir tout",
    viewMessages: "Voir les messages",
    allMedia: "Tous les médias",
    allLinks: "Tous les liens",
    allFiles: "Tous les fichiers",
    associatedMessage: "Message associé",
    sentOn: "Envoyé le",
    returnToLinks: "Retour aux liens",
    searchConversations: "Rechercher des conversations...",
    startAudioCall: "Démarrer un appel audio",
    startVideoCall: "Démarrer un appel vidéo",
    blockUserTitle: "Bloquer l'utilisateur",
    unblockUserTitle: "Débloquer l'utilisateur",
    moreOptions: "Plus d'options",
    uploadFile: "Télécharger un fichier",
    selectEmoji: "Sélectionner un emoji",
    emojiModalTitle: "Choisir un emoji",
    groupChat: "Discussion de groupe",
    createGroup: "Créer un groupe",
    groupName: "Nom du groupe",
    enterGroupName: "Entrez le nom du groupe",
    groupMembers: "Membres du groupe",
    addMember: "Ajouter un membre",
    removeMember: "Supprimer un membre",
    leaveGroup: "Quitter le groupe",
    confirmLeaveGroup: "Êtes-vous sûr de vouloir quitter ce groupe ?",
    groupMessage: "Message de groupe",
    writeGroupMessage: "Écrire un message au groupe...",
    groupSidebarTitle: "Salons de discussion",
    searchGroups: "Rechercher des salons...",
    newGroupChat: "Nouveau salon",
    groupInfo: "Informations du salon",
    groupDescription: "Description du salon",
    enterGroupDescription: "Entrez une description pour le salon",
    groupCreatedBy: "Créé par",
    groupCreatedOn: "Créé le",
    groupSettings: "Paramètres du salon",
    muteGroup: "Mettre le salon en sourdine",
    unmuteGroup: "Réactiver les notifications du salon",
    pinGroup: "Épingler le salon",
    unpinGroup: "Désépingler le salon",
    deleteGroup: "Supprimer le salon",
    confirmDeleteGroup:
      "Êtes-vous sûr de vouloir supprimer ce salon ? Cette action est irréversible.",
    selectRoom: "Sélectionnez un salon",
    selectRoomDesc:
      "Choisissez un salon pour commencer à discuter avec d'autres membres.",
    selectRoomInfo: "Sélectionnez un salon pour voir les informations",
    connectedMembers: "Membres connectés",
    invite: "Inviter",
    inviteMembers: "Inviter des membres",
    inviteFriends: "Inviter des amis",
    shareInviteLink:
      "Partagez ce lien pour inviter des amis à rejoindre ce groupe. Ce lien ne fonctionne que dans l'application.",
    copyLink: "Copier le lien",
    inviteLinkCopied: "Lien d'invitation copié dans le presse-papiers",
    copyLinkFailed: "Échec de la copie du lien",
    max: "Max",
    backgroundColor: "Couleur de l'arrière-plan",
    chooseBackgroundColor: "Choisir la couleur de l'arrière-plan",
    allMessages: "Tous les messages",
    mentionsOnly: "Mentions uniquement",
    disabled: "Désactivées",
    notificationSettings: "Paramètres de notification",
    public: "Publique",
    private: "Privée",
    privacySettings: "Paramètres de confidentialité",
    reportUser: "Signaler l'utilisateur",
    blockUser: "Bloquer l'utilisateur",
    unblock: "Débloquer",
    block: "Bloquer",
    unblockConfirmation:
      "Voulez-vous débloquer cet utilisateur ? Vous pourrez à nouveau interagir avec lui.",
    blockConfirmation:
      "Voulez-vous bloquer cet utilisateur ? Cet utilisateur ne pourra plus vous envoyer de messages ou interagir avec vous.",
    reportReasonPrompt: "Pourquoi signalez-vous cet utilisateur ?",
    reportReason: "Raison du signalement",
    inappropriateBehavior: "Comportement inapproprié",
    spam: "Spam",
    harassment: "Harcèlement",
    toggleSidebar: "Basculer la barre latérale",
    send: "Envoyer",
    messageSentGroup: "Message envoyé dans le groupe:",
    emojiAdded: "Emoji ajouté au message:",
    videoUploaded: "Vidéo uploadée:",
    fileUploaded: "Fichier uploadé:",
    groupVideoCallStarted: "Appel vidéo de groupe démarré",
    groupAudioCallStarted: "Appel audio de groupe démarré",
    me: "Moi",
    amisDesc: "Trouvez de nouveaux amis pour partager vos passions",
    rencontresDesc: "Rencontrez votre âme sœur ou vivez de belles aventures",
    connaissancesDesc:
      "Élargissez votre cercle social et rencontrez de nouvelles personnes",
    mariageDesc: "Pour ceux qui cherchent une relation sérieuse et durable",
    generalDesc: "Discussion libre pour tous les membres",
    invalidFormat: "Format non valide",
    acceptedFormats: "Formats acceptés",
    ok: "OK",
    duration: "Durée",
    redo: "Refaire",
    voiceMessage: "Message vocal",
    recordVoiceMessage: "Enregistrer un message vocal",
    sendVoiceMessage: "Envoyer le message vocal",
    cancelRecording: "Annuler l'enregistrement",
    recording: "Enregistrement...",
    videoCall: "Appel vidéo",
    audioCall: "Appel audio",
    groupCall: "Appel de groupe",
    connecting: "Connexion...",
    waiting: "En attente...",
    muteAudio: "Désactiver le micro",
    unmuteAudio: "Activer le micro",
    disableVideo: "Désactiver la vidéo",
    enableVideo: "Activer la vidéo",
    endCall: "Raccrocher",
    welcomeMessage: "Bienvenue sur la plateforme",
    favoriteConversations: "Vos conversations favorites",
    sharePhotos: "Partagez vos photos",
    customizeExperience: "Personnalisez votre expérience",
    adminPanel: "Panneau d'administration",
    manageProfile: "Gérez votre profil",
    confirmBlock:
      "Êtes-vous sûr de vouloir bloquer %s ? Cette personne ne pourra plus vous envoyer de messages.",
    confirmUnblock:
      "Êtes-vous sûr de vouloir débloquer %s ? Cette personne pourra à nouveau vous envoyer des messages.",
    processing: "En cours...",

    // Testimonials
    whatUsersSay: "Ce que disent nos utilisateurs",
    // Mocked testimonials removed to ensure frontend is data-empty

    // Footer
    allRightsReserved: "Tous droits réservés.",

    // Descriptions pour paramètres
    editPersonalInfo: "Modifier vos informations personnelles",
    manageSecuritySettings: "Gérer vos paramètres de sécurité",
    managePrivacySettings: "Gérer vos paramètres de confidentialité",
    configureAlerts: "Configurer vos alertes et notifications",
    darkLightMode: "Mode sombre ou clair",
    chooseLanguage: "Choisir votre langue",
    helpCenterFAQ: "Centre d'aide et FAQ",

    // Messages supplémentaires
    sharedMediaHint:
      "Les médias partagés dans vos conversations apparaîtront ici",
    sharedVideo: "a partagé une vidéo",
    sharedFile: "a partagé un fichier",
    videoSizeLimit: "Les vidéos ne doivent pas dépasser 20 Mo",
    fileSizeLimit: "Les fichiers ne doivent pas dépasser 20 Mo",
    videoDurationLimit: "Les vidéos ne doivent pas dépasser 2 minutes",
    close: "Fermer",
    audioNotSupported: "Votre navigateur ne supporte pas l'audio",
    sharedImage: "a partagé une image",
    general: "Général",
    gridView: "Vue grille",
    listView: "Vue liste",

    // Favoris (Bookmarks)
    bookmarksDescription:
      "Retrouvez tous vos messages, médias et liens sauvegardés",
    searchBookmarks: "Rechercher dans vos favoris...",
    filterBookmarks: "Filtrer",
    allTypes: "Tous les types",
    messagesType: "Messages",
    mediaType: "Médias",
    filesType: "Fichiers",
    linksType: "Liens",
    activeFilters: "Filtres actifs:",
    noResultsFound: "Aucun résultat trouvé",
    modifySearchCriteria: "Essayez de modifier vos critères de recherche",
    noBookmarksYet: "Aucun favori pour le moment",
    addToBookmarks:
      "Ajoutez des messages, médias ou liens à vos favoris pour les retrouver ici",
    resultsDisplayed: "résultat(s) affiché(s) sur",
    totalBookmarks: "favori(s) total",
    byAuthor: "Par",
    removeBookmark: "Supprimer des favoris",
    clearSearch: "Effacer la recherche",
    removeTypeFilter: "Supprimer le filtre de type",
    // Mocked bookmark content removed to ensure frontend is data-empty
    message: "Message",
    media: "Média",
    file: "Fichier",
    link: "Lien",
    other: "Autre",

    // Contenu du profil utilisateur
    defaultBio: "",
    // Mocked bio content removed to ensure frontend is data-empty
    emailCannotBeChanged: "L'adresse email ne peut pas être modifiée",
    voyages: "Voyages",
    cuisine: "Cuisine",
    lecture: "Lecture",
    cinema: "Cinéma",
    sport: "Sport",
    femme: "Femme",
    homme: "Homme",
    autre: "Autre",
    amis: "Amis",
    rencontres: "Rencontres",
    connaissances: "Connaissances",
    mariage: "Mariage",

    // Contenu pour InterestsModal
    add: "Ajouter",
    remove: "Supprimer",
    done: "Terminé",
    addCustomInterest: "Ajouter un centre d'intérêt personnalisé",
    customInterestPlaceholder: "Entrez un centre d'intérêt personnalisé",
    customInterests: "Centres d'intérêt personnalisés",
    selectedInterests: "centres d'intérêt sélectionnés",
    musique: "Musique",
    art: "Art",
    photographie: "Photographie",
    technologie: "Technologie",
    gaming: "Gaming",
    nature: "Nature",
    danse: "Danse",
    mode: "Mode",
    fitness: "Fitness",
    yoga: "Yoga",
    meditation: "Méditation",
    sciences: "Sciences",
    histoire: "Histoire",
    langues: "Langues",
    ecriture: "Écriture",
    jardinage: "Jardinage",
    bricolage: "Bricolage",
    animaux: "Animaux",
    benevolat: "Bénévolat",
    entrepreneuriat: "Entrepreneuriat",
    finance: "Finance",
    politique: "Politique",
    philosophie: "Philosophie",
    spiritualite: "Spiritualité",
    saveChanges: "Enregistrer les modifications",
    saveChangesPrompt:
      "Veuillez enregistrer vos modifications ou annuler avant de quitter cette page.",
    stay: "Rester",

    // Paramètres du profil
    profilePhoto: "Photo de profil",
    changePhoto: "Changer la photo",
    fullName: "Nom complet",
    enterFullName: "Entrez votre nom complet",
    age: "Âge",
    enterAge: "Entrez votre âge",
    gender: "Genre",
    enterGender: "Entrez votre genre",
    biography: "Biographie",
    writeBiography: "Écrivez une courte biographie",
    location: "Localisation",
    enterLocation: "Entrez votre localisation",
    status: "Statut",
    enterStatus: "Entrez votre statut",
    interests: "Centres d'intérêt",
    addInterest: "Ajouter un centre d'intérêt",
    manageInterests: "Gérer les centres d'intérêt",
    newInterest: "Nouveau centre d'intérêt",
    // Paramètres de confidentialité
    whoCanSeeOnline: "Qui peut me voir en ligne",
    controlOnlineStatus: "Contrôlez qui peut voir votre statut en ligne",
    everyone: "Tout le monde",
    contactsOnly: "Contacts uniquement",
    nobody: "Personne",
    privateMessages: "Messages privés",
    whoCanSendMessages: "Qui peut vous envoyer des messages directs",
    readReceipts: "Lecture des messages",
    showReadReceipts: "Afficher les accusés de lecture",

    // Paramètres de notifications
    calls: "Appels",
    groupMessages: "Messages de groupe",
    emailNotifications: "Notifications par email",
    newMessagesNotification:
      "Recevoir des notifications pour les nouveaux messages",
    callsNotification: "Recevoir des notifications pour les appels",
    groupMessagesNotification: "Recevoir des notifications pour les groupes",
    emailSummary: "Recevoir un résumé par email",

    // Paramètres d'apparence
    textSize: "Taille du texte",
    light: "Clair",
    dark: "Sombre",
    small: "Petite",
    normal: "Normale",
    large: "Grande",

    // Paramètres de sécurité
    changePassword: "Changer le mot de passe",
    updatePassword:
      "Mettez à jour votre mot de passe pour sécuriser votre compte",
  };

  const t = (key: string, ...args: string[]): string => {
    // Return the French translation if available, otherwise return the key
    let text = translations[key] || key;
    if (args.length > 0) {
      args.forEach((arg, i) => {
        text = text.replace(`%${i + 1}`, arg).replace("%s", arg);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
