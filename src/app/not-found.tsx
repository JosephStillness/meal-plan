import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state">
      <h1>This recipe isn’t on the menu.</h1>
      <p>Let’s find you something delicious instead.</p>
      <Link className="button primary" href="/recipes">
        Explore recipes
      </Link>
    </div>
  );
}
