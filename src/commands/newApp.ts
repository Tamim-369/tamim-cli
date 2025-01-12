import inquirer from "inquirer";
import { spawnSync } from "child_process";
import { existsSync, rmSync, rmdirSync } from "fs";
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
        console.error("\n❌ Error: The current directory is not empty");
        console.error(
          "   Please use an empty directory or specify a new directory name\n"
        );
        return;
      }
    } else {
      console.error(`\n❌ Error: The directory '${name}' already exists`);
      console.error("   Please choose another name\n");
      return;
    }
  }

  const gitUrl = "https://github.com/Tamim-369/tamim-template.git";

  try {
    console.log("\n🚀 Initializing new project...");

    // Clone directly using the provided name
    console.log(`\n📦 Downloading template...`);
    spawnSync("git", ["clone", gitUrl, name], {
      stdio: "pipe", // Change to pipe to suppress git output
      cwd: process.cwd(),
    });

    console.log(
      `✅ Template downloaded successfully${
        isCurrentDir ? " to current directory" : ` to ./${name}`
      }`
    );

    // Remove .git folder with proper error handling
    const gitFolder = join(destination, ".git");
    if (existsSync(gitFolder)) {
      try {
        console.log("\n🔧 Preparing project structure...");
        // First attempt: Use rmSync with recursive option
        rmSync(gitFolder, { recursive: true, force: true });
      } catch (error) {
        try {
          // Second attempt: Use git command to clean up (works better on Windows)
          spawnSync("git", ["clean", "-fxd"], {
            stdio: "pipe",
            cwd: destination,
          });
          // Remove .git directory using git command
          spawnSync("git", ["checkout-index", "-a", "-f", "--prefix=./"], {
            stdio: "pipe",
            cwd: destination,
          });
          rmSync(gitFolder, { recursive: true, force: true });
        } catch (innerError) {
          console.warn("\n⚠️  Warning: Git folder cleanup incomplete");
          console.warn("   You may need to remove the .git folder manually\n");
        }
      }
    }

    const packageManager = answers.packageManager;

    // Remove lock files based on chosen package manager
    const lockFiles: Record<string, string[]> = {
      npm: ["yarn.lock", "pnpm-lock.yaml", "bun.lockb"],
      yarn: ["package-lock.json", "pnpm-lock.yaml", "bun.lockb"],
      pnpm: ["package-lock.json", "yarn.lock", "bun.lockb"],
      bun: ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"],
    };

    // Remove unnecessary lock files
    console.log(`\n📝 Configuring ${packageManager}...`);
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

    console.log("\n📥 Installing dependencies...");
    spawnSync(installCommands[packageManager], {
      stdio: "pipe",
      cwd: destination,
      shell: true,
    });

    console.log("\n✨ Success! Your new project is ready.");
    console.log(
      `\n📁 Project location: ${
        isCurrentDir ? "current directory" : `./${name}`
      }`
    );
    console.log("\n🎉 You can now start developing your application:");
    if (!isCurrentDir) {
      console.log(`   cd ${name}`);
    }
    console.log(
      `   ${packageManager}${packageManager === "npm" ? " run" : ""} dev\n`
    );
  } catch (error) {
    console.error("\n❌ Error: Failed to initialize project");
    console.error(
      `   ${
        isCurrentDir
          ? "Could not setup current directory"
          : `Could not create ${name}`
      }`
    );
    console.error(`   ${error}\n`);

    // Clean up the destination directory if it was created
    if (!isCurrentDir && existsSync(destination)) {
      console.log("🧹 Cleaning up...");
      rmSync(destination, { recursive: true, force: true });
    }
  }
}
