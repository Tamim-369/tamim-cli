import inquirer from "inquirer";
import { spawnSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { join } from "path";

export default async function newApp(): Promise<void> {
  const questions: any = [
    {
      type: "input",
      name: "name",
      message: "What is the name of your new app?",
      validate: (input: string) => {
        if (input.trim() === "") {
          return "Please enter a valid name.";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "packageManager",
      message: "Which package manager do you want to use?",
      choices: ["npm", "yarn", "pnpm", "bun"],
    },
  ];

  const answers = await inquirer.prompt(questions);

  // Handle current directory case
  const name = answers.name.trim();
  const isCurrentDir = name === ".";
  const destination = isCurrentDir ? process.cwd() : join(process.cwd(), name);

  // Check if destination exists and is not empty (for current directory)
  if (existsSync(destination)) {
    if (isCurrentDir) {
      const files = require("fs").readdirSync(destination);
      // Filter out hidden files and common files that might exist
      const relevantFiles = files.filter(
        (file: string) =>
          !file.startsWith(".") &&
          !["node_modules", "package.json"].includes(file)
      );

      if (relevantFiles.length > 0) {
        console.error(
          `The current directory is not empty. Please use an empty directory or specify a new directory name.`
        );
        return;
      }
    } else {
      console.error(
        `The directory '${name}' already exists. Please choose another name.`
      );
      return;
    }
  }

  const gitUrl = "https://github.com/Tamim-369/tamim-template.git";

  try {
    // Clone directly using the provided name, even for current directory
    spawnSync("git", ["clone", gitUrl, name], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    console.log(
      `Repository cloned successfully${
        isCurrentDir ? " into current directory" : ` into ${name}`
      }.`
    );

    const packageManager = answers.packageManager;

    // Remove lock files based on chosen package manager
    const lockFiles: Record<string, string[]> = {
      npm: ["yarn.lock", "pnpm-lock.yaml", "bun.lockb"],
      yarn: ["package-lock.json", "pnpm-lock.yaml", "bun.lockb"],
      pnpm: ["package-lock.json", "yarn.lock", "bun.lockb"],
      bun: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"],
    };

    // Remove unnecessary lock files
    lockFiles[packageManager].forEach((file) => {
      rmSync(join(destination, file), { force: true });
    });

    // Install dependencies with chosen package manager
    const installCommands: Record<string, string> = {
      npm: "npm install",
      yarn: "yarn install",
      pnpm: "pnpm install",
      bun: "bun install",
    };

    spawnSync(installCommands[packageManager], {
      stdio: "inherit",
      cwd: destination,
      shell: true,
    });
  } catch (error) {
    console.error(
      `Failed to ${
        isCurrentDir
          ? "setup current directory"
          : `clone repository into ${name}`
      }:`,
      error
    );
    // Clean up the destination directory if it was created
    if (!isCurrentDir && existsSync(destination)) {
      rmSync(destination, { recursive: true, force: true });
    }
  }
}
