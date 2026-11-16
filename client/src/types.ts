export interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse extends User {
  error?: string;
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
}

export interface DashboardProps {
  username?: string;
}