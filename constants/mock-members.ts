export type Member = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  jobTitle: string;
  company?: string;
  quartier: string;
  city: string;
  bio: string;
  isVerified: boolean;
  email?: string;
  phone?: string;
};

export const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Léa',
    lastName: 'Martin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
    jobTitle: 'Fondatrice',
    company: 'Marseille Labs',
    quartier: 'Joliette',
    city: 'Marseille',
    bio: 'J’accompagne les startups marseillaises dans leur lancement et leur croissance. Passionnée par l’innovation locale et les écosystèmes collaboratifs.',
    isVerified: true,
    email: 'lea@marielleabs.fr',
    phone: '+33 6 14 22 88 01',
  },
  {
    id: '2',
    firstName: 'Karim',
    lastName: 'Benali',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    jobTitle: 'CEO',
    company: 'Azur Retail',
    quartier: 'Prado',
    city: 'Marseille',
    bio: 'Spécialiste du retail et du e-commerce. Je cherche des partenaires logistiques et des marques locales pour développer notre réseau en PACA.',
    isVerified: true,
    email: 'karim@azur-retail.fr',
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Durand',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80',
    jobTitle: 'Consultante indépendante',
    quartier: 'Euroméditerranée',
    city: 'Marseille',
    bio: 'Conseil en stratégie et transformation digitale pour PME. Ouverte aux collaborations sur des projets à impact en région marseillaise.',
    isVerified: false,
    phone: '+33 6 78 45 12 90',
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Roux',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80',
    jobTitle: 'Agent immobilier',
    company: 'Phocéa Home',
    quartier: 'Vieux-Port',
    city: 'Marseille',
    bio: 'Expert immobilier sur Marseille intra-muros et les quartiers du sud. Je mets en relation investisseurs et entrepreneurs cherchant des locaux.',
    isVerified: true,
    email: 'thomas@phocea-home.fr',
    phone: '+33 6 55 33 21 07',
  },
  {
    id: '5',
    firstName: 'Nadia',
    lastName: 'El Amrani',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=80',
    jobTitle: 'Kinésithérapeute',
    company: 'Cabinet Santé Sud',
    quartier: 'Cours Julien',
    city: 'Marseille',
    bio: 'Praticienne en rééducation et bien-être au travail. Je collabore avec des entreprises locales pour la santé des équipes.',
    isVerified: true,
  },
  {
    id: '6',
    firstName: 'Julien',
    lastName: 'Moreau',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    jobTitle: 'Producteur',
    company: 'Méditerranée Créative',
    quartier: 'Panier',
    city: 'Marseille',
    bio: 'Production audiovisuelle et événementielle. Toujours partant pour des projets culturels qui mettent en valeur Marseille.',
    isVerified: false,
    email: 'julien@medcreative.fr',
  },
  {
    id: '7',
    firstName: 'Amina',
    lastName: 'Diallo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    jobTitle: 'CTO',
    company: 'Harbor Tech',
    quartier: 'Joliette',
    city: 'Marseille',
    bio: 'Développement de solutions SaaS pour le secteur maritime. Je recrute et cherche des mentors tech dans la French Tech Aix-Marseille.',
    isVerified: true,
    email: 'amina@harbortech.io',
    phone: '+33 6 91 04 77 33',
  },
  {
    id: '8',
    firstName: 'Marc',
    lastName: 'Lefèvre',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80',
    jobTitle: 'Gérant',
    company: 'Provence BTP',
    quartier: 'Saint-Barnabé',
    city: 'Marseille',
    bio: 'Entreprise de rénovation et construction légère. Partenariats recherchés avec architectes et promoteurs locaux.',
    isVerified: true,
    phone: '+33 6 12 88 44 55',
  },
];

export function findMemberById(id: string): Member | undefined {
  return MOCK_MEMBERS.find((m) => m.id === id);
}
