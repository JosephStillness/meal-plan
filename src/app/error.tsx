"use client";
import { WarningCircle } from "@phosphor-icons/react";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <WarningCircle size={42} className="empty-icon" />
      <h2>We couldn’t open this page.</h2>
      <p>
        Check that PostgreSQL is running and the database has been migrated and
        seeded.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
