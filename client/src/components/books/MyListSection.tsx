import { Book } from "@/interfaces/home.interface";
import BookCard from "./BookCard";
import { Heart } from "lucide-react";

interface MyListSectionProps {
  books: Book[];
  onRemoveFromMyList: (book: Book) => void;
}

const MyListSection = ({ books, onRemoveFromMyList }: MyListSectionProps) => {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="rounded-full bg-muted p-6 mb-6">
          <Heart className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
          Your List is Empty
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Save your favorite books to build your personal reading list. Browse the library and click "Add to List" on any book you love.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <div
          key={book.id}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <BookCard
            book={book}
            onRemoveFromMyList={onRemoveFromMyList}
            variant="mylist"
          />
        </div>
      ))}
    </div>
  );
};

export default MyListSection;
