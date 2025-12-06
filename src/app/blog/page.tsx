import BlurFade from "@/components/magicui/blur-fade";
import { getBlogPosts } from "@/data/blog";
import Link from "next/link";

export const metadata = {
	title: "Blog",
	description: "My thoughts on software development, life, and more."
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
	const posts = await getBlogPosts();

	return (
		<section className="max-w-2xl mx-auto py-10">
			<BlurFade delay={BLUR_FADE_DELAY}>
				<h1 className="font-bold text-3xl mb-10 tracking-tight text-center">Blogs</h1>
			</BlurFade>
			<div className="space-y-6">
				{posts
					.sort((a, b) => {
						if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
							return -1;
						}
						return 1;
					})
					.map((post, id) => (
						<BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
							<Link
								className="block rounded-xl border border-border/40 bg-card/60 shadow-md hover:shadow-lg transition-shadow duration-200 p-6 hover:bg-accent/30 group"
								href={`/blog/${post.slug}`}
							>
								<div className="flex flex-col">
									<p className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors duration-200">
										{post.metadata.title}
									</p>
									<p className="mt-2 text-xs text-muted-foreground">
										{new Date(post.metadata.publishedAt).toLocaleDateString(undefined, {
											year: "numeric",
											month: "long",
											day: "numeric"
										})}
									</p>
								</div>
							</Link>
						</BlurFade>
					))}
			</div>
		</section>
	);
}
