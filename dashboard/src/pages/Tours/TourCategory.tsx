import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GalleryPage from "../Gallery/GalleryPage";

// Define the Category type
type Category = {
    id: number;
    name: string;
    description: string;
};

const TourCategory = () => {
    const [categories, setCategories] = useState<Category[]>([
        { id: 1, name: "Electronics", description: "Electronics category" },
        { id: 2, name: "Clothing", description: "Clothing category" },
        { id: 3, name: "Home & Garden", description: "Home and garden category" },
    ]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({ name: "", description: "" });
    const [dialogOpen, setDialogOpen] = useState(false);
    const handleCreateCategory = () => {
        setCategories([...categories, { id: categories.length + 1, ...newCategory }]);
        setNewCategory({ name: "", description: "" });
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
    };

    const handleUpdateCategory = () => {
        if (editingCategory) {
            setCategories(
                categories.map((c) =>
                    c.id === editingCategory.id
                        ? { ...c, name: editingCategory.name, description: editingCategory.description }
                        : c,
                ),
            );
            setEditingCategory(null);
        }
    };

    const handleDeleteCategory = (id: number) => {
        setCategories(categories.filter((c) => c.id !== id));
    };


    const handleImageSelect = (imageUrl: string) => {
        if (imageUrl) {
            setDialogOpen(false); // Close the dialog
        }
    };


    return (
        <div>

            <div className="grid mx-auto w-full max-w-6xl gap-6">
                {/* Create Category Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Create Category</CardTitle>
                        <CardDescription>Add a new category to your store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form>
                            {/* Grid with two columns */}
                            <div className="grid grid-cols-5 gap-4">
                                {/* Left Column: Image */}
                                <div className="col-span-1 p-4">
                                    <Label htmlFor="image">Choose Image</Label>

                                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                        <DialogTrigger >
                                            <img
                                                src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png"
                                                alt="Category Image"
                                                className="w-[200px] h-[200px] object-cover"  // Makes image responsive
                                            />
                                            <span className="pl-2">Choose Image</span></DialogTrigger>
                                        <DialogContent
                                            className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                            onInteractOutside={(e) => {
                                                e.preventDefault();
                                            }}
                                        >
                                            <DialogHeader>
                                                <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                <div className="upload dialog">
                                                    <GalleryPage
                                                        isGalleryPage={false}
                                                        onImageSelect={(imageUrl) =>
                                                            handleImageSelect(imageUrl)
                                                        }
                                                    />
                                                </div>
                                            </DialogHeader>
                                            <DialogDescription>
                                                Select a Image.
                                            </DialogDescription>
                                        </DialogContent>
                                    </Dialog>

                                </div>

                                {/* Right Column: Title and Description */}
                                <div className="col-span-4 grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={newCategory.description}
                                            onChange={(e) =>
                                                setNewCategory({
                                                    ...newCategory,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button onClick={handleCreateCategory}>Create Category</Button>
                    </CardFooter>
                </Card>

            </div>
            {/* Mapped Categories */}
            <div className="mx-auto w-full max-w-6xl mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                    <Card key={category.id}>
                        <CardHeader>
                            <CardTitle>{category.name}</CardTitle>
                            <CardDescription>{category.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {editingCategory?.id === category.id ? (
                                <form>
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                                <DialogTrigger >
                                                    <span className="mb-2 float-left">Choose Image</span>

                                                    <img
                                                        src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png"
                                                        alt="Category Image"
                                                        className="w-full h-[200px] object-cover mb-3"  // Makes image responsive
                                                    />
                                                </DialogTrigger>
                                                <DialogContent
                                                    className="asDialog max-w-[90%] max-h-[90%] overflow-auto"
                                                    onInteractOutside={(e) => {
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <DialogHeader>
                                                        <DialogTitle className="mb-3 text-left">Choose Image From Gallery</DialogTitle>
                                                        <div className="upload dialog">
                                                            <GalleryPage
                                                                isGalleryPage={false}
                                                                onImageSelect={(imageUrl) =>
                                                                    handleImageSelect(imageUrl)
                                                                }
                                                            />
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogDescription>
                                                        Select a Image.
                                                    </DialogDescription>
                                                </DialogContent>
                                            </Dialog>
                                            <Label htmlFor={`edit-name-${category.id}`}>Name</Label>
                                            <Input
                                                id={`edit-name-${category.id}`}
                                                value={editingCategory.name}
                                                onChange={(e) =>
                                                    setEditingCategory({
                                                        ...editingCategory,
                                                        name: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor={`edit-description-${category.id}`}>Description</Label>
                                            <Textarea
                                                id={`edit-description-${category.id}`}
                                                value={editingCategory.description}
                                                onChange={(e) =>
                                                    setEditingCategory({
                                                        ...editingCategory,
                                                        description: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="grid gap-2">
                                    <div>
                                        <img
                                            src="https://res.cloudinary.com/dmokg80lf/image/upload/v1724640910/main/tour-cover/lvogwxntqxv4mloyccxn.png"
                                            alt="Category Image"
                                            className="w-full h-[200px] object-cover mb-3"  // Makes image responsive
                                        />
                                        <span className="font-semibold">Name:</span> {category.name}
                                    </div>
                                    <div>
                                        <span className="font-semibold">Description:</span> {category.description}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="border-t px-6 py-4">
                            {editingCategory?.id === category.id ? (
                                <>
                                    <Button onClick={handleUpdateCategory}>Save</Button>
                                    <Button variant="outline" className="ml-2" onClick={() => setEditingCategory(null)}>
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => handleEditCategory(category)}>
                                        Edit
                                    </Button>
                                    <Button variant="outline" className="ml-2" onClick={() => handleDeleteCategory(category.id)}>
                                        Delete
                                    </Button>
                                </>
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TourCategory;
