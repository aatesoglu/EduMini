// src/context/EnrollmentContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import type { EnrollmentFormValues } from "../types";

interface EnrollmentContextType {
  enrollment: EnrollmentFormValues | null;
  setEnrollment: (data: EnrollmentFormValues) => void;
}

const EnrollmentContext = createContext<EnrollmentContextType | undefined>(
  undefined
);

export const EnrollmentProvider = ({ children }: { children: ReactNode }) => {
  const [enrollment, setEnrollment] = useState<EnrollmentFormValues | null>(
    null
  );
  return (
    <EnrollmentContext.Provider value={{ enrollment, setEnrollment }}>
      {children}
    </EnrollmentContext.Provider>
  );
};

export const useEnrollment = () => {
  const context = useContext(EnrollmentContext);
  if (!context) {
    throw new Error("useEnrollment must be used within EnrollmentProvider");
  }
  return context;
};
