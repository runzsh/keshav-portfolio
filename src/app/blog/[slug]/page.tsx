import { getBlogPosts } from "@/data/blog";
import { DATA } from "@/data/resume";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import Image from "next/image";

export async function generateStaticParams() {
	const posts = await getBlogPosts();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
	params
}: {
	params: {
		slug: string;
	};
}): Promise<Metadata | undefined> {
	const posts = await getBlogPosts();
	const post = posts.find((p: any) => p.slug === params.slug);

	if (!post) return undefined;

	let { title, publishedAt: publishedTime, summary: description } = post.metadata;
	let ogImage = `${DATA.url}/og?title=${title}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${DATA.url}/blog/${post.slug}`,
			images: [
				{
					url: ogImage
				}
			]
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage]
		}
	};
}

async function markdownToHTML(markdown: string) {
	const p = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify).process(markdown);
	return p.toString();
}

export default async function Blog({
	params
}: {
	params: {
		slug: string;
	};
}) {
	const posts = await getBlogPosts();
	const post = posts.find((p: any) => p.slug === params.slug);

	if (!post) {
		notFound();
	}

	const html = await markdownToHTML(post.rawContent);

	return (
		<section id="blog">
			<script
				type="application/ld+json"
				suppressHydrationWarning
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						"headline": post.metadata.title,
						"datePublished": post.metadata.publishedAt,
						"dateModified": post.metadata.publishedAt,
						"description": post.metadata.summary,
						"url": `${DATA.url}/blog/${post.slug}`,
						"author": {
							"@type": "Person",
							"name": DATA.name
						}
					})
				}}
			/>
			<h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">{post.metadata.title}</h1>
			<div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
				<Suspense fallback={<p className="h-5" />}>
					<p className="text-sm text-neutral-600 dark:text-neutral-400">{formatDate(post.metadata.publishedAt)}</p>
				</Suspense>
			</div>

			{post.photos && post.photos.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-[650px]">
					{post.photos.map((photo: string, index: number) => (
						<div key={index} className="relative aspect-video w-full overflow-hidden rounded-lg">
							<img
								src={photo}
								alt={`${post.metadata.title} - Image ${index + 1}`}
								className="object-cover w-full h-full"
							/>
						</div>
					))}
				</div>
			)}

			<article className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }}></article>
		</section>
	);
}
