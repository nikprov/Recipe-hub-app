// src/types/index.ts

export interface Comment {
  id: number;
  created_at: string;
  updated_at: string;
  author: string;
  content: string;
  recipe: number;
}

export interface User {
  username: string;
  isAdmin: boolean;
  token: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string, password2: string) => Promise<void>;
  tokenExpiry: Date | null;
}

export interface JwtPayload {
  token_type: string;
  exp: number;
  iat: number;
  jti: string;
  user_id: number;
  username: string;
  is_staff: boolean;
  email: string;
}

export interface DjangoUser {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface DifficultyRating {
  id: number;
  rating: number;
  rating_author: {
    username: string;
    id: number;
    email: string;
  };
  created_at: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cooking_time: number;
  created_at: string;
  updated_at: string;
  author: string | { username: string; id: number; email: string };
  comments: Comment[];
  average_difficulty: number;
  user_rating: number | null;
  difficulty_ratings?: DifficultyRating[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}