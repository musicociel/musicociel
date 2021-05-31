import type { NamedBlob } from "../common/files/formats/formats";

export class NodeBlob implements NamedBlob {
  constructor(public nodeBuffer: Buffer, public type: string = "", public name?: string) {}

  get size(): number {
    return this.nodeBuffer.length;
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.nodeBuffer;
  }

  async text(): Promise<string> {
    return this.nodeBuffer.toString("utf8");
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    return new NodeBlob(this.nodeBuffer.slice(start, end), contentType);
  }

  stream(): ReadableStream<any> {
    throw new Error("Method not implemented.");
  }
}

export class Blob extends NodeBlob {
  constructor(content: (string | Uint8Array | ArrayBuffer | NodeBlob)[]) {
    super(
      Buffer.concat(
        content.map((item) => {
          if (item instanceof NodeBlob) {
            return item.nodeBuffer;
          }
          return Buffer.from(item as any);
        })
      )
    );
  }
}
