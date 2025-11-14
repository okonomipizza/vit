import { Command } from "commander";
import { startServer } from "../server/index.js";
import path from "node:path";
import fs from "node:fs";
import { error } from "node:console";

const program = new Command();

const DEFAULT_DEV_PORT = 3000;
const DEFAULT_PROD_PORT = 8080;

program
    .name("vit")
    .description("A local image viewer with web interface")
    .version("0.0.1");

program
    .command("set-root <dir-name>")
    .description("Register designated directory as a root directory of vit")
    .addHelpText(
        "after",
        `
    Examples:
      $ vit set-root /path/to/project
      $ vit set-root .              # Use current directory
`,
    )
    .action(async (dirName: string) => {
        try {
            await createSymLink(dirName);
            process.exit(0);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : "Unknown error",
            );
            process.exit(1);
        }
    });

program
    .command("add <file-name>")
    .description("Add a file to the viewer")
    .action(async (fileName: string) => {
        try {
            console.log(`Adding file: ${fileName}`);

            const sourcePath = path.isAbsolute(fileName)
                ? fileName
                : path.join(process.cwd(), fileName);
            if (!fs.existsSync(sourcePath)) {
                console.error(`File not found: ${sourcePath}`);
                process.exit(1);
            }

            // Get the symlink target directory
            const rootDir = await getDataRootDir();

            // Copy file to the root directory
            const destPath = path.join(rootDir, path.basename(fileName));

            if (fs.existsSync(destPath)) {
                console.warn(
                    `Warning: File already exists at destination: ${destPath}`,
                );
                //TODO Rename to name(2)
                console.log("Overwriting...");
            }

            fs.copyFileSync(sourcePath, destPath);
            console.log(`Successfully added file: ${path.basename(fileName)}`);

            process.exit(0);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : "Unknown error",
            );
            process.exit(1);
        }
    });

program
    .command("rm <file-name>")
    .description("Remove a file to the viewer")
    .action(async (fileName: string) => {
        try {
            // TODO implement detail
            console.log(`Removed file: ${fileName}`);
            process.exit(0);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : "Unknown error",
            );
            process.exit(1);
        }
    });

interface CliOptions {
    port?: number;
}

function getDefaultPort(): number {
    const isDevelopment = process.env.NODE_ENV !== "production";
    return isDevelopment ? DEFAULT_DEV_PORT : DEFAULT_PROD_PORT;
}

// default action (activate server)
program
    .option("--port <port>", "server port number", parseInt)
    .action(async (options: CliOptions) => {
        try {
            const port = options.port || Number(process.env.PORT) || getDefaultPort();

            await startServer(port);
        } catch (error) {
            console.error(
                "Error:",
                error instanceof Error ? error.message : "Unknown error",
            );
            process.exit(1);
        }
    });

program.parse();

async function createSymLink(dirName: string) {
    try {
        if (!dirName || dirName === "") {
            console.error("Error: Directory name is required");
            process.exit(1);
        }

        let targetPath: string;

        if (dirName === ".") {
            targetPath = process.cwd();
        } else {
            targetPath = path.join(process.cwd(), dirName);
        }

        // symlink will be created at home directory
        const symlinkPath = path.join(process.env.HOME || "~", ".vit-root");

        if (fs.existsSync(symlinkPath)) {
            fs.unlinkSync(symlinkPath);
        }

        fs.symlinkSync(targetPath, symlinkPath, "dir");
        console.log(`Symlink created: ${symlinkPath} -> ${targetPath}`);

        process.exit(0);
    } catch {
        console.error(
            "Error:",
            error instanceof Error ? error.message : "Unknown error",
        );
        process.exit(1);
    }
}

export async function getDataRootDir(): Promise<string> {
    try {
        const symlinkPath = path.join(process.env.HOME || "~", ".vit-root");
        return symlinkPath;
    } catch {
        console.error(
            "Error:",
            error instanceof Error ? error.message : "Unknown error",
        );
        process.exit(1);
    }
}
