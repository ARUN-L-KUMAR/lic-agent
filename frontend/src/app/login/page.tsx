"use client";

import { LogoMark } from "@/components/brand/logo";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth";
import { useAuthStore } from "@/stores/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");
    try {
      await authService.login(data.email, data.password);
      const user = await authService.me();
      setUser(user);
      if (user.role === "AGENT" || user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
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
            LIC Agent Platform
          </span>
        </Link>

        <div className="card" style={{ padding: "2.5rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              textAlign: "center",
            }}
          >
            Sign In
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            Access your account and manage your insurance journey
          </p>

          {error && (
            <div
              className="disclaimer-box"
              style={{
                background: "var(--danger-light)",
                border: "1px solid #fca5a5",
                color: "var(--danger)",
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
            >
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? "error" : ""}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label className="form-label" htmlFor="password">
                    Password <span className="required">*</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: "0.8125rem",
                      color: "#004B87",
                      textDecoration: "none",
                      fontWeight: 500,
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-input ${errors.password ? "error" : ""}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ paddingRight: "2.75rem" }}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "0.875rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: "2px",
                    }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              fontSize: "0.9rem",
              color: "var(--text-muted)",
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{ color: "#004B87", fontWeight: 600, textDecoration: "none" }}
            >
              Register
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div
          style={{
            marginTop: "1.5rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.6,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <Shield size={12} style={{ marginTop: "2px", flexShrink: 0, color: "var(--text-muted)" }} />
          Your information is protected. This platform uses encrypted, secure connections.
          This is not the official LIC website.
        </div>
      </div>
    </div>
  );
}
