export type PreRegistrationFormState = {
  ok: boolean;
  message: string;
  fieldErrors: Partial<
    Record<
      "guardianName" | "phoneE164" | "studentName" | "birthYear" | "note" | "consent",
      string[]
    >
  >;
};

export const initialPreRegistrationFormState: PreRegistrationFormState = {
  ok: false,
  message: "",
  fieldErrors: {},
};
