"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  BookOpen,
  CalendarDots,
  Basket,
  Jar,
  ArrowUpRight,
  Plant,
  CheckCircle,
  Heart,
  ArrowRight,
  List,
  X,
} from "@phosphor-icons/react";
import { useEffect, useState, type ReactNode } from "react";
import { useStore } from "./store";

const navigation = [
  { href: "/", name: "Home", shortName: "Home", icon: House },
  { href: "/recipes", name: "Recipes", shortName: "Recipes", icon: BookOpen },
  {
    href: "/meal-plan",
    name: "Meal planner",
    shortName: "My week",
    icon: CalendarDots,
  },
  {
    href: "/shopping-list",
    name: "Shopping list",
    shortName: "Shop",
    icon: Basket,
  },
  { href: "/pantry", name: "My pantry", shortName: "Pantry", icon: Jar },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const store = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [mobileOpen]);
  const count = store.shopping?.items.length ?? 0;
  const activeName =
    navigation.find((n) => n.href === pathname)?.name ??
    (pathname === "/login"
      ? "Sign in"
      : pathname === "/register"
        ? "Create account"
        : "Recipe details");
  return (
    <div className="app-shell">
      <aside
        id="kitchen-navigation"
        className={`sidebar ${mobileOpen ? "is-open" : ""}`}
      >
        <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brand-icon">
            <Plant weight="bold" size={29} />
          </span>
          MealMate<span className="brand-dot">.</span>
        </Link>
        <button
          className="mobile-close icon-button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={22} />
        </button>
        <div className="nav-caption">MAKE YOURSELF AT HOME</div>
        <nav aria-label="Main navigation">
          {navigation.map(({ href, name, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`nav-link ${(href === "/" ? pathname === "/" : pathname.startsWith(href)) ? "active" : ""}`}
              aria-current={
                (href === "/" ? pathname === "/" : pathname.startsWith(href))
                  ? "page"
                  : undefined
              }
            >
              <Icon size={21} weight={pathname === href ? "fill" : "regular"} />
              <span>{name}</span>
              {href === "/shopping-list" && count > 0 && (
                <span className="nav-count">{count}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-saved">
          <Link
            className="nav-link"
            href="/recipes?saved=true"
            onClick={() => setMobileOpen(false)}
          >
            <Heart size={21} />
            <span>Saved recipes</span>
            <span className="saved-count">{store.saved.length}</span>
          </Link>
        </div>
        <div className="sidebar-bottom">
          <div className="kitchen-note">
            <Plant size={28} />
            <h3>
              Start with what’s
              <br />
              in your cupboard.
            </h3>
            <p>A few staples can go a long way.</p>
            <Link href="/pantry">
              Check your pantry <ArrowUpRight size={17} />
            </Link>
          </div>
          {store.user ? (
            <div className="local-profile">
              <span className="avatar">{store.user.name[0].toUpperCase()}</span>
              <div>
                <strong>{store.user.name}</strong>
                <button
                  disabled={store.busy}
                  onClick={store.logout}
                  className="logout-button"
                >
                  Sign out
                </button>
              </div>
              <span className="local-indicator" title="Signed in" />
            </div>
          ) : (
            <Link href="/login" className="button secondary full-width">
              Sign in to your kitchen <ArrowRight size={17} />
            </Link>
          )}
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="nav-backdrop"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="menu-button icon-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              aria-controls="kitchen-navigation"
            >
              <List size={23} />
            </button>
            <span>Your kitchen</span>
            <span className="breadcrumb-slash">/</span>
            <strong>{activeName}</strong>
          </div>
          <div className="topbar-right">
            <span className="small-note">
              <span className="green-dot" /> A little less dinner stress
            </span>
            <Link
              href="/shopping-list"
              className="topbar-basket"
              aria-label={`Shopping list, ${count} ingredients`}
            >
              <Basket size={21} />
              {count > 0 && <span>{count}</span>}
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {store.error && (
            <div role="alert" className="storage-warning">
              <span>{store.error}</span>
              <button onClick={store.retry}>Retry</button>
            </div>
          )}
          {children}
        </main>
        <footer className="footer">
          <span>Made for real life. And really good food.</span>
          <span>
            Cook. Plan. Shop. <Plant size={15} />
          </span>
        </footer>
      </div>
      <nav className="mobile-tabs" aria-label="Kitchen shortcuts">
        {navigation.map(({ href, shortName, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={23} weight={active ? "fill" : "regular"} />
              <span>{shortName}</span>
            </Link>
          );
        })}
      </nav>
      {store.notice && (
        <div className="toast" role="status">
          <CheckCircle size={22} weight="fill" />
          {store.notice}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => store.notify("")}
          >
            <X size={19} />
          </button>
        </div>
      )}
    </div>
  );
}
