import PropertyObserver from '../src/PropertyObserver';

describe('PropertyObserver', () => {
  let host;
  let observer;
  let spy;

  beforeEach(() => {
    spy = jasmine.createSpy('callback');
    host = { test: 'test' };
    observer = new PropertyObserver(host, 'test');
  });

  it('is singleton', () => {
    const observer2 = new PropertyObserver(host, 'test');
    expect(observer).toEqual(observer2);
  });

  it('adds observer', () => {
    observer.observe(spy);
    host.test; // eslint-disable-line

    expect(spy).toHaveBeenCalled();
  });

  it('removes observer', () => {
    observer.observe(spy);
    host.test; // eslint-disable-line

    observer.unobserve(spy);
    host.test; // eslint-disable-line

    expect(spy.calls.count()).toEqual(1);
  });
});
