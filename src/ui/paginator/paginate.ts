import type { Column, ItemToPaginate, Size, Slide } from "./type";

const reduceScale = (item: ItemToPaginate, width: number, height: number) => {
  if (item.width > width) {
    item.scale *= width / item.width;
    item.height *= width / item.width;
    item.width = width;
  }
  if (item.height > height) {
    item.scale *= height / item.height;
    item.width *= height / item.height;
    item.height = height;
  }
};

const positionItems = ({ slides, xMargin, yMargin, xSpace, ySpace }) => {
  let curTop: number;
  let curLeft: number;
  for (let slideIndex = 0, sl = slides.length; slideIndex < sl; slideIndex++) {
    const curSlide = slides[slideIndex];
    curLeft = xMargin;
    for (let columnIndex = 0, cl = curSlide.columns.length; columnIndex < cl; columnIndex++) {
      const curColumn = curSlide.columns[columnIndex];
      let curColumnWidth = 0;
      curTop = yMargin;
      for (let itemIndex = 0, il = curColumn.items.length; itemIndex < il; itemIndex++) {
        const item = curColumn.items[itemIndex];
        const spaceBefore = item.spaceBefore || 0;
        if (itemIndex > 0) {
          curTop += spaceBefore;
        }
        item.slide = slideIndex;
        item.left = curLeft;
        item.top = curTop;
        curTop += item.height + ySpace;
        if (item.width > curColumnWidth) {
          curColumnWidth = item.width;
        }
      }
      curLeft += curColumnWidth + xSpace;
    }
  }
};

export const paginateFactory =
  ({
    afterPagination = ({ minScale, slides }: { minScale: number; slides: Slide[] }) => {},
    beforePagination = (items: ItemToPaginate[], size: Size) => ({}),
    ...options
  } = {}) =>
  (items: ItemToPaginate[], { width, height }: Size) => {
    const {
      xMargin = 10,
      yMargin = 10,
      xSpace = 20,
      ySpace = 0
    } = {
      ...options,
      ...beforePagination(items, {
        width,
        height
      })
    };

    const realWidth = width - 2 * xMargin;
    const realHeight = height - 2 * yMargin;

    let minScale = 1;
    let curColumnHeight = 0;
    let curColumnWidth = 0;
    let curSlideWidth = 0;
    let curColumn: Column = {
      items: []
    };
    let curSlide = { columns: [curColumn] };
    const slides: Slide[] = [curSlide];
    for (const item of items) {
      reduceScale(item, realWidth, realHeight);
      if (item.slide < 0) continue;
      if (item.scale < minScale) minScale = item.scale;
      if (curColumnHeight + item.height + ySpace > realHeight) {
        // add another column
        curColumn = { items: [] };
        curColumnHeight = 0;
        curColumnWidth = 0;
        if (curSlideWidth + item.width + xSpace > realWidth) {
          // add another slide
          curSlide = { columns: [] };
          curSlideWidth = 0;
          slides.push(curSlide);
        }
        if (curSlide.columns.length > 0) {
          curSlideWidth += xSpace;
        }
        curSlide.columns.push(curColumn);
      } else if (item.width - curColumnWidth + curSlideWidth > realWidth) {
        // move the column to a new slide, as the added line would make the column too wide
        curSlide.columns.pop();
        curSlide = { columns: [curColumn] };
        curSlideWidth = curColumnWidth;
        slides.push(curSlide);
      }
      if (curColumn.items.length > 0) {
        curColumnHeight += ySpace;
      }
      curColumn.items.push(item);
      curColumnHeight += item.height;
      if (item.width > curColumnWidth) {
        curSlideWidth += item.width - curColumnWidth;
        curColumnWidth = item.width;
      }
    }
    positionItems({ slides, xMargin, yMargin, xSpace, ySpace });
    afterPagination({ minScale, slides });
  };
