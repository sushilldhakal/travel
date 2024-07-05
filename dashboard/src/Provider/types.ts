export interface Author {
    _id: string;
    name: string;
}

export interface Tour {
    _id: string;
    title: string;
    description: string;
    genre: string;
    author: Author;
    file: string;
    createdAt: string;
}