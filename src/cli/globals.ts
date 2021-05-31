import { DOMParser, XMLSerializer } from "xmldom";
import { Blob } from "./blob";

global.DOMParser = DOMParser;
global.XMLSerializer = XMLSerializer;
(global as any).Blob = Blob;
