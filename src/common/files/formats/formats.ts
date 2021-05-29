export enum FileFormat {
  PDF = "pdf",
  TEXT = "text",
  HTML = "html",
  OPENSONG = "opensong",
  CHORDPRO = "chordpro"
}

export interface NamedBlob extends Blob {
  name?: string;
}
