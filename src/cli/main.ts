import yargs from "yargs";
import { serverCommand } from "./commands/server";
import { songTransformCommand } from "./commands/songTransform";

yargs
  .scriptName("musicociel")
  .usage("$0 <cmd> [args]")
  .env("MUSICOCIEL")
  .command(serverCommand)
  .command(songTransformCommand)
  .completion()
  .demandCommand()
  .strict()
  .help().argv;
