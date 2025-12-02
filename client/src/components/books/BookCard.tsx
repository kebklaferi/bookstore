import { Book } from "@/interfaces/home.interface";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: Book;
  isInMyList?: boolean;
  onAddToMyList?: (book: Book) => void;
  onRemoveFromMyList?: (book: Book) => void;
  onDelete?: (bookId: number) => void;
  showActions?: boolean;
  variant?: "default" | "mylist";
}

const BookCard = ({
  book,
  isInMyList = false,
  onAddToMyList,
  onRemoveFromMyList,
  onDelete,
  showActions = true,
  variant = "default",
}: BookCardProps) => {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card shadow-soft hover-lift",
        "border border-border/50"
      )}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <img
          src={book.image}
          alt={`Cover of ${book.title}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Quick actions overlay */}
        {showActions && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2 p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            {variant === "default" && onAddToMyList && (
              <Button
                size="sm"
                variant={isInMyList ? "secondary" : "accent"}
                onClick={() => onAddToMyList(book)}
                disabled={isInMyList}
                className="shadow-soft-lg"
              >
                {isInMyList ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Add to List</span>
                  </>
                )}
              </Button>
            )}
            
            {variant === "mylist" && onRemoveFromMyList && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRemoveFromMyList(book)}
                className="shadow-soft-lg"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>Remove</span>
              </Button>
            )}
          </div>
        )}

        {/* Saved indicator */}
        {isInMyList && variant === "default" && (
          <div className="absolute top-3 right-3">
            <div className="rounded-full bg-accent p-2 shadow-soft-lg">
              <Heart className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-tight text-foreground line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
        
        {book.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {book.description}
          </p>
        )}

        {/* Bottom actions */}
        {onDelete && (
          <div className="mt-auto pt-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(book.id)}
              className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Book</span>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
};

export default BookCard;
