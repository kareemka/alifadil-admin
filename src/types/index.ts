export interface Accessory {
    id: string;
    name: string;
    price: number;
    image?: string;
}

export interface Product {
    id: string;
    name: string;
    // ... add others as needed
    accessories: Accessory[];
}
