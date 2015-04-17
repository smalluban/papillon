import State from './state';

export default class Observer {
  constructor(host, properties, callback) {
    if (!host || !properties || !callback) {
      throw new TypeError('Invalid arguments');
    }

    this.host = host;
    this.callback = callback;

    this.properties = [].concat(properties).map((property)=> {
      let descriptor = Object.getOwnPropertyDescriptor(this.host, property);

      if (!descriptor.configurable) {
        throw new TypeError(`'${property}': Configurable property required`);
      }

      return { property, descriptor };
    });

    this.state = new State(
      this.properties.reduce( (list, {property, descriptor}) => {
        let getter, setter;

        list[property] = this.host[property];

        if (descriptor.get) {
          getter = ()=> list[property] = descriptor.get.call(this.host);
        } else {
          getter = ()=> list[property];
        }

        if (descriptor.set) {
          setter = (value)=> {
            descriptor.set.call(this.host, value);
            getter();
          };
        } else {
          setter = (value)=> list[property] = value;
        }

        Object.defineProperty(this.host, property, {
          configurable: true,
          enumerable: descriptor.enumerable,
          get: ()=> {
            this.check();
            return getter();
          },
          set: (value)=> {
            setter(value);
            this.check();
          }
        });

        return list;
      }, {})
    );
  }

  check() {
    if (!this.requestId && !this.checking) {
      this.requestId = window.requestAnimationFrame(()=> {
        this.checking = true;

        if (this.state.isChanged()) {
          this.callback(this.state.changelog);
        }

        this.checking = this.requestId = void 0;
      });
    }
  }

  destroy() {
    if (this.requestId) {
      window.cancelAnimationFrame(this.requestId);
    }

    this.properties.forEach(({property, descriptor}) => {
      if (!descriptor.get && !descriptor.set) {
        descriptor.value = this.state.target[property];
      }
      Object.defineProperty(this.host, property, descriptor);
    });
  }
}
