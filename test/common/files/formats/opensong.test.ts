import fs from "fs";
import path from "path";
import "../../../../src/cli/globals";
import { parse, parseLyrics } from "../../../../src/common/files/formats/opensong/parse";
import { LineType } from "../../../../src/common/files/formats/opensong/type";
import { format, formatLyrics } from "../../../../src/common/files/formats/opensong/format";

describe("opensong", () => {
  describe("parse", () => {
    it("should correctly parse empty lyrics", () => {
      // a file always has at least one line
      expect(parseLyrics("")).toEqual([{ type: LineType.EmptyLine }]);
    });

    it("should correctly parse when a space is missing as the first character in a line", () => {
      expect(parseLyrics(".E\nGod is good")).toEqual([
        { type: LineType.ChordsAndLyrics, chords: [{ chord: "E" }], lyrics: [{ parts: ["God is good"] }] }
      ]);
      expect(parseLyrics(".   E\nGod is good")).toEqual([
        {
          type: LineType.ChordsAndLyrics,
          chords: [{ width: 3 }, { chord: "E" }],
          lyrics: [{ parts: ["God ", "is good"] }]
        }
      ]);
    });

    it("should correctly parse a lyrics line without chords", () => {
      expect(parseLyrics(" God is good")).toEqual([{ type: LineType.ChordsAndLyrics, lyrics: [{ parts: ["God is good"] }] }]);
      expect(parseLyrics("\n God is good")).toEqual([
        { type: LineType.EmptyLine },
        { type: LineType.ChordsAndLyrics, lyrics: [{ parts: ["God is good"] }] }
      ]);
    });
  });

  describe("format", () => {
    it("should correctly format empty lyrics", () => {
      expect(formatLyrics([])).toEqual("");
      expect(formatLyrics([{ type: LineType.EmptyLine }])).toEqual("");
    });

    it("should correctly format word separators", () => {
      expect(
        formatLyrics([
          {
            type: LineType.ChordsAndLyrics,
            chords: [{ chord: "Cm" }, { chord: "Dbm7" }, { chord: "G" }],
            lyrics: [{ parts: ["Je", "sus ", "loves me"] }]
          }
        ])
      ).toEqual(".Cm Dbm7 G\n Je_sus  loves me");
    });
  });

  describe("opensong samples", () => {
    const opensongSamplesFolder = path.join(__dirname, "../../../../sample-songs/opensong");
    fs.readdirSync(opensongSamplesFolder).forEach((fileName) => {
      it(fileName, () => {
        const fileContent = fs.readFileSync(path.join(opensongSamplesFolder, fileName), "utf-8");
        const parsedFile = parse(fileContent);
        const formattedFile = format(parsedFile);
        const parsedFile2 = parse(formattedFile);
        expect(parsedFile).toEqual(parsedFile2);
        expect(formattedFile).toMatchSnapshot();
        expect(parsedFile).toMatchSnapshot();
      });
    });
  });
});
