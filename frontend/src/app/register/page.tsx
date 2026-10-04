"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth";

const schema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters").max(50),
  last_name: z.string().min(2, "Last name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/\d/, "Must contain a number"),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div className="card" style={{ padding: "3rem", textAlign: "center", maxWidth: "440px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              background: "var(--success-light)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "2rem",
            }}
          >
            ✉️
          </div>
          <h2 style={{ fontWeight: 700, marginBottom: "0.75rem" }}>Account Created!</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            A verification email has been sent to your address. Please verify your email to activate your account.
          </p>
          <Link href="/login" className="btn btn-primary" style={{ justifyContent: "center", display: "inline-flex" }}>
            Continue to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            textDecoration: "none",
            marginBottom: "2rem",
          }}
        >
          <LogoMark size={44} />
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#004B87" }}>
            Create Account
          </span>
        </Link>

        <div className="card" style={{ padding: "2.5rem" }}>
          <h1
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              textAlign: "center",
              marginBottom: "0.5rem",
            }}
          >
            Register
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "2rem" }}>
            Track your enquiries, save plans, and manage your insurance journey
          </p>

          {error && (
            <div
              style={{
                background: "var(--danger-light)",
                border: "1px solid #fca5a5",
                color: "var(--danger)",
                padding: "0.875rem 1.25rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1.25rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="first_name">First Name <span className="required">*</span></label>
                  <input id="first_name" type="text" className={`form-input ${errors.first_name ? "error" : ""}`} placeholder="Arjun" {...register("first_name")} />
                  {errors.first_name && <span className="form-error">{errors.first_name.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="last_name">Last Name <span className="required">*</span></label>
                  <input id="last_name" type="text" className={`form-input ${errors.last_name ? "error" : ""}`} placeholder="Kumar" {...register("last_name")} />
                  {errors.last_name && <span className="form-error">{errors.last_name.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address <span className="required">*</span></label>
                <input id="email" type="email" className={`form-input ${errors.email ? "error" : ""}`} placeholder="you@example.com" {...register("email")} />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Mobile Number</label>
                <input id="phone" type="tel" className={`form-input ${errors.phone ? "error" : ""}`} placeholder="9876543210" maxLength={10} {...register("phone")} />
                {errors.phone && <span className="form-error">{errors.phone.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password <span className="required">*</span></label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    style={{ paddingRight: "2.75rem" }}
                    {...register("password")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="form-error">{errors.password.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm_password">Confirm Password <span className="required">*</span></label>
                <input id="confirm_password" type="password" className={`form-input ${errors.confirm_password ? "error" : ""}`} placeholder="Repeat your password" {...register("confirm_password")} />
                {errors.confirm_password && <span className="form-error">{errors.confirm_password.message}</span>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#004B87", fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
