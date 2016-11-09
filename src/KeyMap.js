class KeyMap {
  constructor() {
    this.map = new Map();
  }

  set(key, value) {
    let list = this.map.get(key);
    if (!list) {
      list = new Set();
      this.map.set(key, list);
    }

    if (value) {
      list.add(value);
    }

    return list;
  }

  shift(key, value) {
    const set = this.map.get(key);
    if (set && set.size) {
      if (set.has(value)) {
        set.delete(value);
        return value;
      }

      for (const result of set) {
        set.delete(result);
        return result;
      }
    }
    return false;
  }
}

export default KeyMap;
