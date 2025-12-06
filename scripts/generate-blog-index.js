const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "../content");
const blogPhotosDir = path.join(__dirname, "../public/blog");
const files = fs.readdirSync(postsDir);

const posts = files
	.filter((f) => f.endsWith(".mdx"))
	.map((f) => {
		const slug = f.replace(/\.mdx$/, "");
		const content = fs.readFileSync(path.join(postsDir, f), "utf-8");
		// Extract frontmatter metadata
		const match = content.match(/---\n([\s\S]*?)\n---/);
		let metadata = {};
		let rawContent = content;
		let photos = [];

		if (match) {
			match[1].split("\n").forEach((line) => {
				const [key, ...rest] = line.split(":");
				if (key && rest.length) {
					const value = rest.join(":").trim();
					if (key.trim() === "photos") {
						// If photos field exists in frontmatter, get photos from that folder
						const photoFolder = path.join(blogPhotosDir, value);
						if (fs.existsSync(photoFolder)) {
							const photoFiles = fs
								.readdirSync(photoFolder)
								.filter((file) => /\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i.test(file))
								.map((file) => `/blog/${value}/${file}`);
							photos = photoFiles;
						}
					} else {
						metadata[key.trim()] = value;
					}
				}
			});
			// Remove frontmatter from content
			rawContent = content.slice(match[0].length).trim();
		}

		return {
			slug,
			metadata,
			photos,
			rawContent
		};
	});

fs.writeFileSync(path.join(__dirname, "../src/data/blog-index.json"), JSON.stringify(posts, null, 2));

console.log("Blog index generated!");
