/**
 * ================================================================
 *  __        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____
 *  \ \      / /| ____| __ )/ ___|| |/ /_ _|_   _|_   _| ____|  _ \/ ___|
 *   \ \ /\ / / |  _| |  _ \\___ \| ' / | |  | |   | | |  _| | |_) \___ \
 *    \ V  V /  | |___| |_) |___) | . \ | |  | |   | | | |___|  _ < ___) |
 *     \_/\_/   |_____|____/|____/|_|\_\___| |_|   |_| |_____|_| \_\____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
import Link from "next/link";
import { apiGet } from "../../../../lib/api";
import { toMetadata } from "../../../../lib/seo";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const [data, settings] = await Promise.all([
    apiGet<any>(`/api/public/blogs/category/${slug}`),
    apiGet<any>("/api/public/settings")
  ]);
  return toMetadata(data?.category, settings);
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await apiGet<any>(`/api/public/blogs/category/${slug}`);
  return (
    <section className="container page">
      <h1>{data?.category?.name || "Blog Category"}</h1>
      <div className="grid">{(data?.blogs || []).map((blog: any) => <Link className="card" key={blog.id || blog.permalink} href={blog.permalink}>{blog.title}</Link>)}</div>
    </section>
  );
}
