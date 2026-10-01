"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LockKey,
  CalendarDots,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { shiftWeek, useStore } from "./store";

export function KitchenGate({
  children,
  returnTo,
}: {
  children: ReactNode;
  returnTo?: string;
}) {
  const pathname = usePathname();
  const next = returnTo ?? pathname;
  const store = useStore();
  if (!store.ready)
    return <div className="page-skeleton" aria-label="Loading your kitchen" />;
  if (!store.user)
    return (
      <div className="empty-state sign-in-state">
        <LockKey size={42} className="empty-icon" />
        <h2>Một góc bếp của riêng bạn.</h2>
        <p>
          Đăng nhập để lưu công thức riêng, kế hoạch tuần và danh sách đi chợ.
        </p>
        <div className="button-row">
          <Link
            href={{ pathname: "/register", query: { next } }}
            className="button primary"
          >
            Tạo tài khoản <ArrowRight size={18} />
          </Link>
          <Link
            href={{ pathname: "/login", query: { next } }}
            className="button secondary"
          >
            Đăng nhập
          </Link>
        </div>
        <small>Bạn vẫn có thể xem món ăn trước khi đăng nhập.</small>
      </div>
    );
  return <>{children}</>;
}

export function WeekControl() {
  const store = useStore();
  const start = new Date(`${store.week}T12:00:00`),
    end = new Date(start);
  end.setDate(end.getDate() + 6);
  const format = (date: Date) =>
    date.toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  return (
    <div className="week-control">
      <button
        className="icon-button"
        disabled={store.busy}
        aria-label="Previous week"
        onClick={() => store.setWeek(shiftWeek(store.week, -1))}
      >
        <ArrowLeft size={18} />
      </button>
      <span>
        <CalendarDots size={18} />
        {format(start)} – {format(end)}, {start.getFullYear()}
      </span>
      <button
        className="icon-button"
        disabled={store.busy}
        aria-label="Next week"
        onClick={() => store.setWeek(shiftWeek(store.week, 1))}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
