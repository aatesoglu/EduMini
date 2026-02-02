export interface Enrolment {
  id: number;
  student: string;
  course: string;
  date: string;
}

export interface AdminStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
}
