import { Observer } from '../papillon';

describe('Observer', ()=>{

  describe('constructor', ()=> {
    it('throw error for invalid arguments', ()=> {
      expect(()=> new Observer()).toThrow();
      expect(()=> new Observer({})).toThrow();
      expect(()=> new Observer({}, 'one')).toThrow();
      expect(()=> new Observer(undefined, 'one', ()=> {})).toThrow();
    });

    it('throw error for non-configurable properties', ()=> {
      let host = {};
      Object.defineProperty(host, 'one', {
        value: 'test'
      });
      expect(()=> new Observer(host, 'one', ()=> {})).toThrow();
    });
  });

  describe('observe changes with host object', ()=> {
    let host, list, value;

    beforeEach(()=> {
      value = 'one';
      host = {
        one: 'one',
        get two() { return value; },
        set two(newVal) { value = newVal; }
      };
      let observer = new Observer(host, ['one', 'two'], ()=> {});
      list = observer.state.target;
    });

    it('link watched property to list object', ()=> {
      expect(list.one).toEqual('one');
      host.one = 'new value';
      expect(list.one).toEqual('new value');
    });

    it('link watched getter/setter property to list object', ()=> {
      expect(host.two).toEqual('one');
      expect(list.two).toEqual('one');
      host.two = 'new value';
      expect(list.two).toEqual('new value');
      expect(value).toEqual('new value');
    });
  });

  describe('check method', ()=> {
    let host, observer;

    beforeEach(()=> {
      host = { one: 'two' };
      observer = new Observer(host, 'one', ()=> {});
      spyOn(observer, 'check');
    });

    it('called when getting watched property', ()=> {
      host.one;
      expect(observer.check).toHaveBeenCalled();
    });
  });

  describe('callback', ()=> {
    let host, spy;

    beforeEach(()=> {
      host = { one: 'two'};
      spy = jasmine.createSpy('spy');
      new Observer(host, 'one', spy);
    });

    it('called when property changed before next repaint', (done)=> {
      host.one = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('called with proper changelog', (done)=> {
      host.one = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).toHaveBeenCalledWith({
          one: { type: 'set', oldValue: 'two' }
        });
        done();
      });
    });

    it('not called when not watched property changed', (done)=> {
      host.two = 'new value';
      window.requestAnimationFrame(()=> {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('destroy', ()=> {
    let host, observer, getter, spy;

    beforeEach(()=> {
      getter = ()=> 'one';
      host = { one: 'one'};
      spy = jasmine.createSpy('callback');
      Object.defineProperty(host, 'two', {
        get: getter,
        set: getter,
        configurable: true
      });
      observer = new Observer(host, ['one', 'two'], spy);
    });

    it('revert property to original definition', ()=> {
      let desc = Object.getOwnPropertyDescriptor(host, 'one');
      expect(desc.get).toBeDefined();
      observer.destroy();
      desc = Object.getOwnPropertyDescriptor(host, 'one');
      expect(desc.get).not.toBeDefined();
    });

    it('revert property with actual value', ()=> {
      host.one = 'two';
      observer.destroy();
      expect(host.one).toEqual('two');
    });

    it('revert property getter/setter methods', ()=> {
      observer.destroy();
      let desc = Object.getOwnPropertyDescriptor(host, 'two');
      expect(desc.get).toEqual(getter);
    });

    it('cancel callback call', (done)=> {
      host.one = 'two';
      observer.destroy();
      window.requestAnimationFrame(()=> {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
    });

  });

  describe('with multiply instances', ()=> {
    let host, spy, observer1, observer2;

    beforeEach(()=> {
      host = { one: 'two' };
      spy = jasmine.createSpy('callback');
      observer1 = new Observer(host, 'one', ()=> {});
      observer2 = new Observer(host, 'one', spy);
    });

    it('work after destroying one of them', (done)=> {
      observer1.destroy();
      host.one = 'three';
      window.requestAnimationFrame(()=> {
        expect(spy).toHaveBeenCalled();
        done();
      });
    });

    it('revert to original state before observing', ()=> {
      observer1.destroy();
      observer2.destroy();
      expect(Object.getOwnPropertyDescriptor(host, 'one')).toEqual({
        writable: true,
        enumerable: true,
        configurable: true,
        value: 'two'
      });
    });
  });
});
