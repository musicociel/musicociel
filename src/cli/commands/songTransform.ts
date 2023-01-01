import { promises as fs } from "fs";
import "../globals";
import type { FileFormat } from "../../common/files/formats/formats";
import { openFile } from "../../common/files/openFile";
import { saveFile } from "../../common/files/saveFile";
import { convertFile } from "../../common/files/convertFile";
import { guessFormatFromExtension } from "../../common/files/extensions";
import { transposeFile } from "../../common/files/transposeFile";
import { AlterationsType } from "../../common/music/chords";
import type { CommandModule } from "yargs";

export const songTransformCommand: CommandModule = {
  command: "song-transform",
  describe: "Applies transformations to a song (such as transposing chords, converting it from one format to another)",
  builder: {
    input: {
      type: "string",
      alias: "i",
      description: "Input file",
      demand: true
    },
    "input-format": {
      type: "string",
      description: "Input file format"
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output file"
    },
    "output-format": {
      type: "string",
      alias: "f",
      description: "Output format"
    },
    transpose: {
      type: "number",
      alias: "t",
      default: 0,
      description: "Transpose chords"
    },
    bemol: {
      type: "boolean",
      alias: "b",
      description: "Use bemols instead of sharps when transposing."
    }
  },
  async handler({ input, inputFormat, output, outputFormat, transpose, bemol }: any) {
    const inputBuffer = await fs.readFile(input);
    const blob = new Blob([inputBuffer]);
    let file = await openFile(blob, {
      format: inputFormat as FileFormat
    });
    if (transpose) {
      file = await transposeFile(file, { transpose, alterationType: bemol ? AlterationsType.Bemol : AlterationsType.Sharp });
    }
    if (!outputFormat && output) {
      outputFormat = guessFormatFromExtension(output);
    }
    if (!outputFormat) {
      outputFormat = file.format;
    }
    file = await convertFile(file, outputFormat as FileFormat);
    const savedFile = await saveFile(file);
    const buffer = Buffer.from(await savedFile.arrayBuffer());
    if (output) {
      await fs.writeFile(output, buffer);
    } else {
      process.stdout.write(buffer);
    }
  }
};
