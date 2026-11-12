export interface MediaPhoto {
  id: string;
  src: string;
  title: string;
  caption: string;
  category: 'action' | 'championship' | 'venue' | 'community' | 'goalkeeping';
  categoryLabel: string;
  location: string;
  date?: string;
  featured?: boolean;
  aspectRatio?: 'landscape' | 'portrait' | 'square';
}

export const LEAGUE_PHOTOS: MediaPhoto[] = [
  {
    id: 'photo-champ-01',
    src: '/assets/aistudio/about01_886dfc48.jpg',
    title: 'Championship Trophy Ceremony',
    caption: 'Championship winners celebrating with the season trophy alongside teammates, family, and supporters in front of the goal at F.O. Moxley Community Center.',
    category: 'championship',
    categoryLabel: 'Championships',
    location: 'F.O. Moxley Community Center Gym',
    date: 'Postseason Finals',
    featured: true,
    aspectRatio: 'landscape',
  },
  {
    id: 'photo-action-01',
    src: '/assets/aistudio/001_f6166b79.jpg',
    title: '1v1 Matchday Intensity',
    caption: 'High-speed duel for possession on the indoor hardwood court, showcasing quick turns and close ball control in tight spaces.',
    category: 'action',
    categoryLabel: 'Match Action',
    location: 'Court 1 · F.O. Moxley',
    date: 'Regular Season Fixture',
    featured: true,
    aspectRatio: 'portrait',
  },
  {
    id: 'photo-action-02',
    src: '/assets/aistudio/002_cb93cce5.jpg',
    title: 'BGPR Hardwood Battle',
    caption: 'Physical contest for possession near the Bowling Green Parks & Rec wall padding, featuring Toasty FC and league competitors.',
    category: 'action',
    categoryLabel: 'Match Action',
    location: 'F.O. Moxley Community Center',
    date: 'League Matchday',
    featured: true,
    aspectRatio: 'portrait',
  },
  {
    id: 'photo-keeper-01',
    src: '/assets/aistudio/003_1531010d.jpg',
    title: 'Shot-Stopper Locked In',
    caption: 'Focused futsal goalkeeper in position defending the net, ready for rapid-fire reaction saves and distribution.',
    category: 'goalkeeping',
    categoryLabel: 'Goalkeeping',
    location: 'Main Goal · F.O. Moxley Gym',
    date: 'Championship Playoff',
    featured: true,
    aspectRatio: 'portrait',
  },
  {
    id: 'photo-action-03',
    src: '/assets/aistudio/004_90c30f1c.jpg',
    title: 'Dribble Attack & Crowd Atmosphere',
    caption: 'Attacking midfielder taking on a defender with spectators packing the sidelines and bleachers.',
    category: 'action',
    categoryLabel: 'Match Action',
    location: 'F.O. Moxley Main Gym',
    date: 'Evening Showcase',
    featured: true,
    aspectRatio: 'landscape',
  },
  {
    id: 'photo-community-01',
    src: '/assets/aistudio/about02_49666895.jpg',
    title: 'Sideline Camaraderie & Fan Spirit',
    caption: 'Post-goal celebration and vibrant community atmosphere in front of the packed spectator bleachers.',
    category: 'community',
    categoryLabel: 'Community & Fans',
    location: 'Spectator Bleachers · F.O. Moxley',
    date: 'Matchday Sideline',
    featured: true,
    aspectRatio: 'portrait',
  },
];
