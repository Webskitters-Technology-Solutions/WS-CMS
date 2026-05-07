/**
 * ================================================================
 *  __        __   _     ____  _  _______ _____ _____ _____ _____
 *  \ \      / /__| |__ / ___|| |/ /_   _|_   _| ____|_   _/ ____|
 *   \ \ /\ / / _ \ '_ \\___ \| ' /  | |   | | |  _|   | | \___ \
 *    \ V  V /  __/ |_) |___) | . \  | |   | | | |___  | |  ___) |
 *     \_/\_/ \___|_.__/|____/|_|\_\ |_|   |_| |_____| |_| |____/
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

export async function generateMetadata({ params }: any) {
  const [data, settings] = await Promise.all([
    apiGet<any>(`/api/public/blogs/category/${params.slug}`),
    apiGet<any>("/api/public/settings")
  ]);
  return toMetadata(data?.category, settings);
}

export default async function CategoryPage({ params }: any) {
  const data = await apiGet<any>(`/api/public/blogs/category/${params.slug}`);
  return (
    <section className="container page">
      <h1>{data?.category?.name || "Blog Category"}</h1>
      <div className="grid">{(data?.blogs || []).map((blog: any) => <Link className="card" key={blog.id || blog.permalink} href={blog.permalink}>{blog.title}</Link>)}</div>
    </section>
  );
}
