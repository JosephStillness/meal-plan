import Link from "next/link";
import { RecipeBrowser } from "@/components/recipes";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; q?: string; mine?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="greeting">Cơm nhà và những món bạn thích</p>
          <h1>Món Việt quen, cách nấu riêng.</h1>
        </div>
        <Link href="/recipes/new" className="button primary">
          + Thêm công thức riêng
        </Link>
      </div>
      <RecipeBrowser
        initialMine={params.mine === "true"}
        initialSaved={params.saved === "true"}
        initialQuery={params.q ?? ""}
      />
    </>
  );
}
