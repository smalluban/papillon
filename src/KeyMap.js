class KeyMap {
    constructor() {
      this.map = new Map();
    }

    set(key, value) {
      let set = this.map.get(key);
      if (!set) {
        set = new Set();
        this.map.set(key, set);
      }

      if (value) {
        set.add(value);
      }

      return set;
    }

    shift(key, value) {
      let set = this.map.get(key);
      if (set && set.size) {
        if (set.has(value)) {
          set.delete(value);
          return value;
        } else {
          for(let result of set) {
            set.delete(result);
            return result;
          }
        }
      }
      return false;
    }
}

export default KeyMap;
