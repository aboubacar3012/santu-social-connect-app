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

export type ListMembersApiResponse = {
  members: Member[];
};

export type GetMemberApiResponse = {
  member: Member;
};
