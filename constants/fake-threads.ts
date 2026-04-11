/**
 * Trois familles de fils :
 * - `direct` : conversation entre utilisateurs (bulles + saisie)
 * - `official` : messages du compte Santu officiel (cartes, lecture seule)
 * - `announcement` : rappels & annonces qui remplacent les notifications (cartes, lecture seule)
 */
export type ThreadKind = 'direct' | 'official' | 'announcement';

export type ThreadListItem = {
  id: string;
  name: string;
  /** Sous-titre (compte officiel, ou précision sur le fil). */
  subtitle?: string;
  lastMessage: string;
  time: string;
  unread: number;
  kind: ThreadKind;
  lastFromSelf: boolean;
};

export type ChatMessage = {
  id: string;
  fromMe: boolean;
  text: string;
  time: string;
  /** Titre de carte (fils lecture seule). */
  title?: string;
};

const DIRECT_THREADS: ThreadListItem[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    lastMessage: 'Parfait, je serai à la gare vers 9h15.',
    time: '14:32',
    unread: 2,
    kind: 'direct',
    lastFromSelf: false,
  },
  {
    id: '2',
    name: 'Thomas K.',
    lastMessage: 'Tu as encore une place pour samedi ?',
    time: 'Hier',
    unread: 0,
    kind: 'direct',
    lastFromSelf: false,
  },
  {
    id: '3',
    name: 'Léa & Hugo',
    lastMessage: 'Merci pour le trajet, à très vite !',
    time: 'lun.',
    unread: 0,
    kind: 'direct',
    lastFromSelf: false,
  },
  {
    id: '4',
    name: 'Karim Bensaid',
    lastMessage: 'Je peux décaler de 20 min si besoin.',
    time: '12:05',
    unread: 1,
    kind: 'direct',
    lastFromSelf: false,
  },
  {
    id: '5',
    name: 'Camille R.',
    lastMessage: 'Photo du point de rendez-vous envoyée',
    time: 'dim.',
    unread: 0,
    kind: 'direct',
    lastFromSelf: true,
  },
  {
    id: '6',
    name: 'Groupe trajet',
    lastMessage: 'Julie : j’arrive dans 5 minutes.',
    time: '10:22',
    unread: 4,
    kind: 'direct',
    lastFromSelf: false,
  },
];

/** Ordre liste plate : conversations d’abord, puis rappels & Santu (masqués côté API s’il n’y a rien de neuf). */
export const FAKE_THREAD_LIST: ThreadListItem[] = [
  ...DIRECT_THREADS,
  {
    id: 'rappels',
    name: 'Rappels',
    subtitle: 'À la place des notifications',
    lastMessage: 'Départ demain 7h30 — place de la République.',
    time: 'mar.',
    unread: 1,
    kind: 'announcement',
    lastFromSelf: false,
  },
  {
    id: 'santu',
    name: 'Santu',
    subtitle: 'Compte Santu Officiel',
    lastMessage: 'Qui est dispo pour Lille samedi matin ?',
    time: '09:41',
    unread: 0,
    kind: 'official',
    lastFromSelf: false,
  },
];

const MESSAGES_BY_THREAD: Record<string, ChatMessage[]> = {
  rappels: [
    {
      id: 'r1',
      fromMe: false,
      title: 'Rappel de départ',
      text: 'Départ demain 7h30 place de la République. Merci d’arriver 5 min avant.',
      time: 'mar. 08:00',
    },
    {
      id: 'r2',
      fromMe: false,
      title: 'Ton trajet dans 1 h',
      text: 'Prépare-toi : départ prévu à 15h00 — vérifie le point de rendez-vous dans l’app.',
      time: 'auj. 14:00',
    },
  ],
  santu: [
    {
      id: 'm1',
      fromMe: false,
      title: 'Paris → Lille ce week-end',
      text: 'Bonjour à tous, je propose un trajet Paris → Lille ce week-end. Places à préciser selon les demandes.',
      time: '09:12',
    },
    {
      id: 'm2',
      fromMe: false,
      title: 'Disponibilités samedi matin',
      text: 'Qui est dispo pour Lille samedi matin ? Répondez-moi en message privé.',
      time: '09:41',
    },
  ],
  '1': [
    { id: 'm1', fromMe: false, text: 'Salut ! Tu passes bien par la Part-Dieu ?', time: '14:10' },
    { id: 'm2', fromMe: true, text: 'Oui, arrêt prévu vers 8h45.', time: '14:18' },
    { id: 'm3', fromMe: false, text: 'Parfait, je serai à la gare vers 9h15.', time: '14:32' },
  ],
  '2': [
    { id: 'm1', fromMe: false, text: 'Bonjour, ton trajet Bordeaux–Toulouse est toujours d’actu ?', time: 'Hier 18:20' },
    { id: 'm2', fromMe: true, text: 'Oui, 2 places libres.', time: 'Hier 18:45' },
    { id: 'm3', fromMe: false, text: 'Tu as encore une place pour samedi ?', time: 'Hier 19:02' },
  ],
  '3': [
    { id: 'm1', fromMe: true, text: 'Merci encore pour hier, trajet au top.', time: 'lun. 09:00' },
    { id: 'm2', fromMe: false, text: 'Merci pour le trajet, à très vite !', time: 'lun. 09:05' },
  ],
  '4': [
    { id: 'm1', fromMe: true, text: 'Je pars à 14h pile du centre-ville.', time: '11:50' },
    { id: 'm2', fromMe: false, text: 'Je peux décaler de 20 min si besoin.', time: '12:05' },
  ],
  '5': [
    { id: 'm1', fromMe: false, text: 'Tu peux m’envoyer le point exact du RDV ?', time: 'dim. 16:00' },
    { id: 'm2', fromMe: true, text: 'Photo du point de rendez-vous envoyée', time: 'dim. 16:12' },
  ],
  '6': [
    { id: 'm1', fromMe: true, text: 'On se retrouve au parking nord ?', time: '09:55' },
    { id: 'm2', fromMe: false, text: 'Julie : j’arrive dans 5 minutes.', time: '10:22' },
  ],
};

export function getThreadById(id: string): ThreadListItem | undefined {
  return FAKE_THREAD_LIST.find((t) => t.id === id);
}

export function getMessagesForThread(id: string): ChatMessage[] {
  return (
    MESSAGES_BY_THREAD[id] ?? [
      { id: 'fallback', fromMe: false, text: 'Aucun message pour cette conversation (démo).', time: '' },
    ]
  );
}
