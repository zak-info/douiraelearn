// User Types
export interface User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  email: string;
  username?: string;
  password?: string;
  type?: "professor" | "student" | "admin";
  phone?: string;
  address?: string;
  sex?: "male" | "female";
  data?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Professor-specific type
export interface Professor extends User {
  type: "professor";
  department?: string;
  modules?: string;
  specialization?: string;
}

// Form data types
export interface CreateProfessorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department?: string;
  modules?: string;
  specialization?: string;
  sex?: "male" | "female";
  address?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
