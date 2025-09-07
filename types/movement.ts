export type MovementType = 'INCOME' | 'EXPENSE';

export interface Movement {
  id: string;
  concept: string;
  amount: number;
  date: string;
  type: MovementType;
  description?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMovementData {
  concept: string;
  amount: number;
  date: string;
  type: MovementType;
  description?: string;
}

export interface UpdateMovementData extends CreateMovementData {
  id: string;
}
