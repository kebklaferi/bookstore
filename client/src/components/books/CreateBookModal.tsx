import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, BookPlus } from "lucide-react";
import api from "@/axios";
import { toast } from "@/hooks/use-toast";

interface CreateBookModalProps {
  onBookCreated: () => void;
}

const CreateBookModal = ({ onBookCreated }: CreateBookModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    image: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/books", formData);
      toast({
        title: "Book Added",
        description: `"${formData.title}" has been added to your library.`,
      });
      setFormData({ title: "", author: "", image: "", description: "" });
      setOpen(false);
      onBookCreated();
    } catch (err) {
      console.error("Failed to create book:", err);
      toast({
        title: "Error",
        description: "Failed to add book. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm" className="ml-2">
          <Plus className="h-4 w-4" />
          <span>Add Book</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 p-2">
              <BookPlus className="h-5 w-5 text-accent" />
            </div>
            <DialogTitle className="font-display text-xl">Add New Book</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Fill in the details below to add a new book to your library.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Enter book title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author" className="text-sm font-medium">
              Author
            </Label>
            <Input
              id="author"
              placeholder="Enter author name"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Cover Image URL
            </Label>
            <Input
              id="image"
              placeholder="https://example.com/cover.jpg"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Brief description of the book..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="bg-background resize-none"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookModal;
