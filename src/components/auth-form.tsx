"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plant } from "@phosphor-icons/react";
import { api, useStore } from "./store";

export function AuthForm({
  register = false,
  returnTo,
}: {
  register?: boolean;
  returnTo?: string;
}) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const store = useStore(),
    router = useRouter();
  return (
    <div className="auth-layout">
      <div className="auth-photo">
        <img
          src="/images/pesto-pasta.jpg"
          alt="Pasta with fresh basil and tomatoes"
        />
        <div>
          <Plant size={34} />
          <h2>
            Good food.
            <br />A little less effort.
          </h2>
          <p>Your recipes, your week, your kitchen.</p>
        </div>
      </div>
      <div className="auth-form-wrap">
        <span className="auth-brand">
          <Plant size={24} />
          MealMate
        </span>
        <h1>
          {register ? "Make yourself at home." : "Welcome to your kitchen."}
        </h1>
        <p>
          {register
            ? "Keep your meal plans, shopping lists and pantry in one place."
            : "Sign in and pick up where you left off."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              await api(`auth/${register ? "register" : "login"}`, "POST", {
                name,
                email,
                password,
              });
              await store.refreshUser();
              const target =
                returnTo && URL.canParse(returnTo, window.location.origin)
                  ? returnTo
                  : "/meal-plan";
              const destination = new URL(target, window.location.origin);
              router.push(
                destination.origin === window.location.origin &&
                  !destination.pathname.startsWith("//")
                  ? destination.pathname + destination.search
                  : "/meal-plan",
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "Unable to sign in.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {register && (
            <label>
              Your name
              <input
                required
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {register && <small>At least 8 characters.</small>}
          {error && (
            <div role="alert" className="form-error">
              {error}
            </div>
          )}
          <button className="button primary full-width" disabled={busy}>
            {busy ? "Please wait…" : register ? "Create account" : "Sign in"}
            <ArrowRight size={19} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already have an account?" : "New to MealMate?"}{" "}
          <Link
            href={{
              pathname: register ? "/login" : "/register",
              query: returnTo ? { next: returnTo } : {},
            }}
          >
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
