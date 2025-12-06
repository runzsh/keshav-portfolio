import blogIndex from "./blog-index.json";

export async function getBlogPosts() {
	return blogIndex;
}
