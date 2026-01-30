import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Create account — Shala",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
