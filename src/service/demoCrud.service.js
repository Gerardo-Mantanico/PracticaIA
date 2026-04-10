const isBrowser = () => globalThis.window !== undefined;

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const nowIso = () => new Date().toISOString();

export const createDemoCrudService = ({ storageKey, seed = [], sortBy = "id", customDeleteGuard }) => {
  const ensureStore = () => {
    if (!isBrowser()) return;
    const existing = globalThis.window.localStorage.getItem(storageKey);
    if (!existing) {
      globalThis.window.localStorage.setItem(storageKey, JSON.stringify(seed));
    }
  };

  const readStore = () => {
    if (!isBrowser()) return [...seed];
    ensureStore();
    const raw = globalThis.window.localStorage.getItem(storageKey) || "[]";
    return safeParse(raw, []);
  };

  const writeStore = (items) => {
    if (!isBrowser()) return;
    globalThis.window.localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const getAll = async () => {
    const items = readStore();
    const sorted = [...items].sort((left, right) => {
      const a = left?.[sortBy];
      const b = right?.[sortBy];
      if (typeof a === "number" && typeof b === "number") return a - b;
      return String(a ?? "").localeCompare(String(b ?? ""));
    });
    return sorted;
  };

  const get = async (id) => {
    const items = readStore();
    return items.find((item) => String(item.id) === String(id)) || null;
  };

  const create = async (payload) => {
    const items = readStore();
    const maxId = items.reduce((acc, item) => Math.max(acc, Number(item.id || 0)), 0);
    const item = {
      ...payload,
      id: maxId + 1,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    items.push(item);
    writeStore(items);
    return item;
  };

  const update = async (id, payload) => {
    const items = readStore();
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index < 0) {
      throw new Error("Registro no encontrado");
    }
    const updated = {
      ...items[index],
      ...payload,
      id: items[index].id,
      updatedAt: nowIso(),
    };
    items[index] = updated;
    writeStore(items);
    return updated;
  };

  const remove = async (id) => {
    const items = readStore();
    const index = items.findIndex((item) => String(item.id) === String(id));
    if (index < 0) {
      throw new Error("Registro no encontrado");
    }

    if (typeof customDeleteGuard === "function") {
      customDeleteGuard(items[index], items);
    }

    items.splice(index, 1);
    writeStore(items);
    return true;
  };

  const reset = async () => {
    writeStore(seed);
    return true;
  };

  return {
    getAll,
    get,
    create,
    update,
    delete: remove,
    reset,
  };
};
