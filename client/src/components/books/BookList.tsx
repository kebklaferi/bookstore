import { Book } from "@/interfaces/home.interface";
import BookCard from "./BookCard";
import { BookOpen } from "lucide-react";

interface BookListProps {
  books: Book[];
  myList: Book[];
  onAddToMyList: (book: Book) => void;
  onDeleteBook: (bookId: number) => void;
}

const BookList = ({ books, myList, onAddToMyList, onDeleteBook }: BookListProps) => {
  const isInMyList = (bookId: number) => myList.some((b) => b.id === bookId);

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="rounded-full bg-muted p-6 mb-6">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
          No Books Yet
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          Start building your library by adding your first book. Click the "Add Book" button to get started.
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
            isInMyList={isInMyList(book.id)}
            onAddToMyList={onAddToMyList}
            onDelete={onDeleteBook}
            variant="default"
          />
        </div>
      ))}
    </div>
  );
};

export default BookList;
