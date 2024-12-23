#!/usr/bin/env node
import { program } from "commander";
import addFile from "./commands/addFile.js";
import { createModule } from "./commands/createModule.js";

process.stdin.isTTY = false;
process.stdout.isTTY = false;

if (
  process.argv.toString().includes("--help") ||
  process.argv.toString().includes("-h")
) {
  program.outputHelp();
}
program
  .command("create <name> <fields...>")
  .description(
    "Create a new module with specified fields. For example tamim create moduleName field1:string field2:number field5:ref=>Model field6:array=>string field7:array=>ref=>Model"
  )
  .action(createModule);
program
  .command("add <moduleFiles...>")
  .description(
    "Add a new file to the module. For example tamim add moduleName:fileType "
  )
  .action(addFile);

program.parse(process.argv);
