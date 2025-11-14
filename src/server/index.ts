import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "node:path";
import fs from "node:fs";
import { getDataRootDir } from "../cli";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filePathMap = new Map<string, string>();

export interface DirectoryItem {
	id: string;
	name: string;
	type: "folder" | "image";
	children?: DirectoryItem[];
}

export async function getRootDir(): Promise<string> {
	try {
		const isDevelopment = process.env.NODE_ENV !== "production";
		if (isDevelopment) {
			const testDataDir = join(__dirname, "../../test-data");
			console.log(`Using test data directory: ${testDataDir}`);
			return testDataDir;
		}
		const symlinkPath = path.join(process.env.HOME || "~", ".vit-root");
		return symlinkPath;
	} catch {
		console.error(
			"Error:",
			Error instanceof Error ? Error.message : "Unknown error",
		);
		process.exit(1);
	}
}

function buildDirectoryTree(
	currentPath: string,
	rootPath: string,
): DirectoryItem {
	const stats = fs.statSync(currentPath);
	const name = path.basename(currentPath);
	const uuid = uuidv4();

	if (stats.isDirectory()) {
		const children: DirectoryItem[] = [];
		const entries = fs.readdirSync(currentPath);

		for (const entry of entries) {
			const entryPath = path.join(currentPath, entry);
			try {
				const entryStats = fs.statSync(entryPath);

				if (entryStats.isDirectory()) {
					children.push(buildDirectoryTree(entryPath, rootPath));
				} else if (entryStats.isFile() && isImageFile(entry)) {
					const imageUuid = uuidv4();
					const absolutePath = path.resolve(entryPath);

					filePathMap.set(imageUuid, absolutePath);

					children.push({
						id: imageUuid,
						name: entry,
						type: "image",
					});
				}
			} catch (error) {
				console.error(`Error reading ${entryPath}:`, error);
			}
		}

		return {
			id: uuid,
			name: name || "root",
			type: "folder",
			children,
		};
	}

	const absolutePath = path.resolve(currentPath);
	filePathMap.set(uuid, absolutePath);

	return {
		id: uuid,
		name,
		type: "image",
	};
}

function countImages(directory: DirectoryItem): number {
	let count = 0;
	if (directory.type === "image") {
		count = 1;
	}
	if (directory.children) {
		for (const child of directory.children) {
			count += countImages(child);
		}
	}
	return count;
}

export async function startServer(port: number) {
	const app = express();

	app.use(express.json());

	const clientPath = join(__dirname, "../client");
	app.use(express.static(clientPath));

	app.get("/", (_req, res) => {
		res.sendFile(join(clientPath, "index.html"));
	});

	app.get("/api/images", async (_req, res) => {
		try {
			// init and rebuild map
			filePathMap.clear();

			const rootDir = await getRootDir();
			const directory = buildDirectoryTree(rootDir, rootDir);

			res.json({
				success: true,
				count: countImages(directory),
				directory: directory,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	// API: Get a specific image file
	app.get("/api/images/:uuid", async (req, res) => {
		try {
			const { uuid } = req.params;

			const filePath = filePathMap.get(uuid);

			if (!filePath) {
				return res.status(404).json({
					success: false,
					error: "Image not found",
				});
			}

			if (!fs.existsSync(filePath)) {
				// Remove the file from map
				filePathMap.delete(uuid);
				return res.status(404).json({
					success: false,
					error: "File not found on disk",
				});
			}

			if (!isImageFile(filePath)) {
				return res.status(400).json({
					success: false,
					error: "Not an image file",
				});
			}

			console.log(`Serving image: ${uuid} -> ${filePath}`);

			res.sendFile(filePath);
		} catch (error) {
			res.status(500).json({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	});

	const server = app.listen(port, () => {
		const url = `http://localhost:${port}`;
		console.log(`server running at ${url}`);
	});

	return server;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

function isImageFile(filename: string): boolean {
	const ext = path.extname(filename).toLowerCase();
	return IMAGE_EXTENSIONS.includes(ext);
}
