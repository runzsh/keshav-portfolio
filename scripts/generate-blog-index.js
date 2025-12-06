const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "../content");
const files = fs.readdirSync(postsDir);

const posts = files
	.filter((f) => f.endsWith(".mdx"))
	.map((f) => {
		const slug = f.replace(/\.mdx$/, "");
		const content = fs.readFileSync(path.join(postsDir, f), "utf-8");
		// Extract frontmatter metadata (very basic, adjust as needed)
		const match = content.match(/---\n([\s\S]*?)\n---/);
		let metadata = {};
		let rawContent = content;
		if (match) {
			match[1].split("\n").forEach((line) => {
				const [key, ...rest] = line.split(":");
				if (key && rest.length) {
					metadata[key.trim()] = rest.join(":").trim();
				}
			});
			// Remove frontmatter from content
			rawContent = content.slice(match[0].length).trim();
		}
		return {
			slug,
			metadata,
			rawContent
		};
	});

fs.writeFileSync(path.join(__dirname, "../src/data/blog-index.json"), JSON.stringify(posts, null, 2));

console.log("Blog index generated!");
