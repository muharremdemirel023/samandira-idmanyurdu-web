export type PreRegistrationFormState = {
  ok: boolean;
  message: string;
  fieldErrors: Partial<
    Record<
      | "campaignType"
      | "guardianName"
      | "phoneE164"
      | "email"
      | "studentName"
      | "birthYear"
      | "student2Name"
      | "student2BirthYear"
      | "note"
      | "consent",
      string[]
    >
  >;
};

export const initialPreRegistrationFormState: PreRegistrationFormState = {
  ok: false,
  message: "",
  fieldErrors: {},
};
