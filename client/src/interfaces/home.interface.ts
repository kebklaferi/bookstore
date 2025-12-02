export interface Book {
  id: number;
  title: string;
  author: string;
  image: string;
  description?: string;
}

export interface HomeProps {
  onLogout: () => void;
}
