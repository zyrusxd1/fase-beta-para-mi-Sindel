export type ScreenType = 'inicio' | 'cartas-de-amor' | 'galeria-de-recuerdos' | 'razones-por-las-que-te-amo' | 'cuenta-regresiva';

export interface LoveLetter {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  category: 'primeras' | 'aniversarios' | 'promesas' | 'secretas';
  content: string;
  author?: string;
  sealColor: 'terracotta' | 'rose' | 'sage' | 'gold';
  isRead?: boolean;
}

export interface MemoryPhoto {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  caption: string;
  category: 'viajes' | 'cotidiano' | 'citas' | 'celebraciones';
  likes: number;
}

export interface LoveReason {
  id: string;
  number: number;
  text: string;
  category: 'sonrisa' | 'detalles' | 'recuerdos' | 'paz' | 'futuro';
  isFavorite?: boolean;
}

export interface CoupleSettings {
  partner1: string;
  partner2: string;
  startDate: string; // ISO date format YYYY-MM-DD
  anniversaryName: string;
  nextEventDate: string; // ISO date format YYYY-MM-DD
  nextEventTitle: string;
  songTitle: string;
  songSubtitle: string;
}

export interface BucketItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: 'viajes' | 'experiencias' | 'cotidiano';
}

export interface Milestone {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
}
