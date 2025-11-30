export interface User {
    id: number;
    email: string;
    fullName: string;
    createdAt: string;
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    user: User;
}