export interface Size {
  width: number;
  height: number;
}

export interface Position {
  left: number;
  top: number;
}

export interface ItemToPaginate extends Size, Position {
  dom: HTMLDivElement;
  slide: number;
  scale: number;
}

export interface Column {
  items: ItemToPaginate[];
}

export interface Slide {
  columns: Column[];
}
