// src/types/index.ts
export interface Course {
  id: number;
  title: string;
  category: string;
}

export interface EnrollmentFormValues {
  name: string;
  email: string;
  selectedCourse: string;
}
