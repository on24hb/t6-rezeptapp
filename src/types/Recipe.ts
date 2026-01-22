export interface Recipe {
  id?: string;
  title: string;
  ingredients: string;
  instructions: string;
  createdAt: Date;
  tags?: string[];
}