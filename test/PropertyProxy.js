import PropertyProxy from '../src/PropertyProxy';

describe('PropertyProxy', () => {
  let spy;

  beforeEach(() => {
    spy = jasmine.createSpy('callback');
  });

  it('work with properties from prototype chain', () => {
    const div = document.createElement('div');
    new PropertyProxy(div, 'textContent', spy).on();

    div.textContent = 'new content';

    expect(spy).toHaveBeenCalledWith('new content');
  });

  it('replace value from prototype as native does', () => {
    const parent = { test: 'one' };
    const child = Object.create(parent);
    const proxy = new PropertyProxy(child, 'test', spy);

    proxy.on();
    child.test = 'two';
    proxy.off();

    expect(spy).toHaveBeenCalledWith('two');
    expect(child.test).toEqual('two');
    expect(parent.test).toEqual('one');
  });

  it('clean proxy for not defined and not set property', () => {
    const host = {};
    const proxy = new PropertyProxy(host, 'test', spy);

    proxy.on();
    proxy.off();

    expect({}.hasOwnProperty.call(host, 'test')).toEqual(false);
  });

  it('create not defined properties when set', () => {
    const host = {};
    const proxy = new PropertyProxy(host, 'test', spy);

    proxy.on();
    host.test = 'some value';
    proxy.off();

    expect(host.test).toEqual('some value');
  });
});
