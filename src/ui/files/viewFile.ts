import type { ReadableSignal, WritableSignal } from "@amadeus-it-group/tansu";
import { asReadable, get, writable } from "@amadeus-it-group/tansu";
import { produce, freeze } from "immer";
import { abortError } from "../../common/abortError";
import { closeFactory, onAbort } from "../../common/closeFunction";
import { FileFormat } from "../../common/files/formats/formats";
import { openFile } from "../../common/files/openFile";
import { lazyLoaded } from "../../common/lazyLoaded";
import type { FileAccess, OpenFile, OpenFileData, Viewer, ViewerData, ViewerInterface } from "./types";

const viewComponent = lazyLoaded<string, [ViewerInterface], { component: any; data: any }>({
  [`${FileFormat.TEXT}:display`]: () => import("./formats/text/display"),
  [`${FileFormat.TEXT}:edit`]: () => import("./formats/text/edit"),
  [`${FileFormat.CHORDPRO}:display`]: () => import("./formats/chordpro/display"),
  [`${FileFormat.OPENSONG}:display`]: () => import("./formats/opensong/display")
});
export const viewersForFormat: Record<FileFormat, string[]> = Object.create(null);
export const viewers = new Set();
viewComponent.items.forEach((item) => {
  const [format, viewer] = item.split(":");
  viewers.add(viewer);
  if (!viewersForFormat[format]) {
    viewersForFormat[format] = [];
  }
  viewersForFormat[format].push(viewer);
});

const waitForStoreCondition = <T>(store: ReadableSignal<T>, condition: (value: T) => boolean, signal?: AbortSignal) =>
  new Promise<T>((resolve, reject) => {
    let hasUnsubscribe = false;
    const callUnsubscribe = () => {
      if (hasUnsubscribe) {
        unsubscribe();
      } else {
        hasUnsubscribe = false;
      }
    };
    const removeAbortListener = onAbort(signal, () => {
      reject(abortError());
      callUnsubscribe();
    });
    if (!removeAbortListener) {
      return;
    }
    const unsubscribe = store.subscribe((value) => {
      const hasCondition = condition(value);
      if (hasCondition) {
        resolve(value);
        removeAbortListener();
        callUnsubscribe();
      }
    });
    if (hasUnsubscribe) {
      unsubscribe();
    } else {
      hasUnsubscribe = true;
    }
  });

const waitForContent = async (store: ReadableSignal<OpenFileData>, signal: AbortSignal) =>
  await waitForStoreCondition(store, (value) => !!value.format && "content" in value, signal);

const getViewerFactory =
  (store: WritableSignal<OpenFileData>, signal?: AbortSignal) =>
  (name: string): Viewer | null => {
    if (!viewers.has(name)) {
      return null;
    }
    {
      const storeValue = get(store);
      const existingViewer = storeValue.viewers[name];
      if (existingViewer) {
        return existingViewer;
      }
    }

    const viewerStore = writable<ViewerData>(freeze({}));
    const close = closeFactory(signal);
    const viewer: Viewer = freeze(asReadable(viewerStore, { close }));
    (async () => {
      try {
        const storeContent = await waitForContent(store, close.signal);
        const viewerInterface: ViewerInterface = asReadable(store, {
          set: store.set,
          update: store.update,
          close
        });
        const content = await viewComponent(`${storeContent.format}:${name}`, viewerInterface);
        viewerStore.update(
          produce((value) => {
            value.data = content.data;
            value.component = content.component;
          })
        );
      } catch (error) {
        viewerStore.update(
          produce((value) => {
            value.error = error;
          })
        );
      }
    })();

    store.update(
      produce((value) => {
        value.viewers[name] = viewer;
      })
    );
    return viewer;
  };

export const loadFile = (fileAccess: FileAccess, { format, signal }: { format?: FileFormat; signal?: AbortSignal } = {}): OpenFile => {
  const close = closeFactory(signal);
  const store = writable<OpenFileData>(
    freeze({
      format,
      viewers: {}
    })
  );
  (async () => {
    try {
      const file = await fileAccess.readFile(close.signal);
      store.update(
        produce((value) => {
          value.file = file;
        })
      );
      const content = await openFile(file, { format, signal: close.signal });
      store.update(
        produce((value) => {
          value.format = content.format;
          value.content = content.content;
        })
      );
    } catch (error) {
      store.update(
        produce((value) => {
          value.error = error;
        })
      );
    }
  })();
  return freeze(
    asReadable(store, { getViewer: getViewerFactory(store, close.signal), close, selected: writable(true) } as Pick<
      OpenFile,
      "getViewer" | "close" | "selected"
    >)
  );
};
