import Link from "next/link";
import { getBrand } from "@/lib/brand";
import { timeAgoFor } from "@/lib/format";

export interface PostLite {
  id: number;
  headline: string;
  category: string;
  imageId: number | null;
  publishedAt: Date;
}

export default function NewsCard({ post }: { post: PostLite }) {
  const brand = getBrand();
  return (
    <article className="card">
      <Link href={`/post/${post.id}`} className="thumb" aria-label={post.headline}>
        {post.imageId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/img/${post.imageId}`} alt={post.headline} loading="lazy" />
        ) : null}
      </Link>
      <div className="body">
        <span className="cat">{post.category}</span>
        <h3>
          <Link href={`/post/${post.id}`}>{post.headline}</Link>
        </h3>
        <div className="meta">
          <span>🕐 {timeAgoFor(brand.lang, new Date(post.publishedAt))}</span>
        </div>
      </div>
    </article>
  );
}
