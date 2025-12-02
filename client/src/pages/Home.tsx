import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BookList from "@/components/books/BookList";
import MyListSection from "@/components/books/MyListSection";
import api from "@/axios";
import CreateBookModal from "@/components/books/CreateBookModal";
import type { Book, HomeProps } from "@/interfaces/home.interface";
import { BookOpen, Heart, LogOut, Library } from "lucide-react";

const Home = ({ onLogout }: HomeProps) => {
  const [activeTab, setActiveTab] = useState("books");
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [myList, setMyList] = useState<Book[]>([]);

  const fetchMyList = async () => {
    try {
      const res = await api.get("/my-books");
      setMyList(res.data);
    } catch (err) {
      console.error("Failed to fetch my list:", err);
    }
  };

  const fetchAllBooks = async () => {
    try {
      const res = await api.get("/books");
      setAllBooks(res.data);
    } catch (err) {
      console.error("Failed to fetch all books:", err);
    }
  };

  const handleRefresh = () => {
    fetchAllBooks();
    fetchMyList();
  };

  useEffect(() => {
    fetchMyList();
    fetchAllBooks();
  }, []);

  const handleAddToMyList = async (book: Book) => {
    try {
      await api.post("/my-books", { bookId: book.id });
      fetchMyList();
    } catch (err) {
      console.error("Failed to add book:", err);
    }
  };

  const handleRemoveFromMyList = async (book: Book) => {
    try {
      await api.delete(`/my-books/${book.id}`);
      fetchMyList();
    } catch (err) {
      console.error("Failed to remove book:", err);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await api.delete(`/books/${bookId}`);
      handleRefresh();
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Failed to delete book.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-soft">
              <Library className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="font-display text-xl font-semibold text-foreground hidden sm:block">
              Bookshelf
            </h1>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-secondary/40">
              <TabsTrigger value="books" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Library</span>
              </TabsTrigger>
              <TabsTrigger value="mylist" className="gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">My List</span>
                {myList.length > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                    {myList.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <CreateBookModal onBookCreated={handleRefresh} />
            <Button variant="ghost" size="icon" onClick={onLogout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            {activeTab === "books" ? "Explore Library" : "My Reading List"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {activeTab === "books"
              ? "Discover and save books to your personal collection"
              : `${myList.length} ${myList.length === 1 ? "book" : "books"} in your list`}
          </p>
        </div>

        {/* Content */}
        <div>
          {activeTab === "books" && (
            <BookList
              books={allBooks}
              onAddToMyList={handleAddToMyList}
              onDeleteBook={handleDeleteBook}
              myList={myList}
            />
          )}

          {activeTab === "mylist" && (
            <MyListSection
              books={myList}
              onRemoveFromMyList={handleRemoveFromMyList}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50">
        <div className="container flex h-14 items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">
            Built with love for book lovers
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
