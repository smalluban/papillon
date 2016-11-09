import { State } from '../papillon';

describe('State', () => {
  describe('`now` static method', () => {
    it('update timestamp with next repaint', (done) => {
      const count = State.now();
      window.requestAnimationFrame(() => {
        expect(State.now()).toEqual(count + 1);
        done();
      });
    });
  });

  describe('`is` static method', () => {
    it('returns true for the same object', () => {
      const obj = {};
      expect(State.is(obj, obj)).toEqual(true);
    });

    it('returns true for -0 and +0', () => {
      expect(State.is(-0, -0)).toEqual(true);
    });

    it('returns false for NaN and computed NaN', () => {
      expect(State.is(NaN, 0 / 0)).toEqual(true);
    });
  });

  describe('instance', () => {
    let state;
    let obj;

    beforeEach(() => {
      obj = {};
      state = new State(obj);
    });

    it('throw for not an object as target', () => {
      expect(State.bind(null, 'text')).toThrow();
    });

    it('returns the same object for equal arguments', (done) => {
      obj = {};
      const check = new State(obj).lastCheck;
      window.requestAnimationFrame(() => {
        expect(check).toEqual(new State(obj).lastCheck);
        done();
      });
    });

    it('is not changed when initialized', () => {
      expect(state.isChanged()).toEqual(false);
    });

    it('is not changed for next repaint', (done) => {
      expect(state.isChanged()).toEqual(false);
      window.requestAnimationFrame(() => {
        expect(state.isChanged()).toEqual(false);
        done();
      });
    });

    describe('changelog property', () => {
      it('contains `delete` type', (done) => {
        obj = { one: 'one' };
        state = new State(obj);
        delete obj.one;

        window.requestAnimationFrame(() => {
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: {
              type: 'delete', oldValue: 'one',
            },
          });
          done();
        });
      });

      it('contains `set` type for primitive value', (done) => {
        window.requestAnimationFrame(() => {
          obj.one = 'one';
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: { type: 'set' },
          });
          done();
        });
      });

      it('contains `set` type for object value', (done) => {
        obj = {};
        state = new State(obj);

        window.requestAnimationFrame(() => {
          obj.one = { two: 'three' };

          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: { type: 'set' },
          });
          done();
        });
      });

      it('contains `modify` type for object value', (done) => {
        obj = { one: { two: null } };
        state = new State(obj);

        window.requestAnimationFrame(() => {
          obj.one.two = 'three';
          expect(state.isChanged()).toEqual(true);
          expect(state.changelog).toEqual({
            one: {
              type: 'modify',
              changelog: {
                two: { type: 'set', oldValue: null },
              },
            },
          });
          done();
        });
      });

      describe('`oldKey` parameter', () => {
        beforeEach(() => {
          obj = { a: 'a', b: 'a', c: {}, d: 4 };
          state = new State(obj);
        });

        it('is undefined for no relocated property', (done) => {
          window.requestAnimationFrame(() => {
            obj.a = 4;
            expect(state.isChanged()).toEqual(true);
            expect(state.changelog.a.oldKey).toEqual(undefined);
            done();
          });
        });

        it('has old name for relocated property', (done) => {
          window.requestAnimationFrame(() => {
            Object.assign(obj, { a: 4, d: 'a' });
            expect(state.isChanged()).toEqual(true);
            expect(state.changelog.a.oldKey).toEqual('d');
            expect(state.changelog.d.oldKey).toEqual('a');
            done();
          });
        });

        it('works with array object', (done) => {
          const array = ['a', 'b', 'b', {}];
          state = new State(array);

          window.requestAnimationFrame(() => {
            array[0] = 'b';
            array[1] = array[3];
            array[2] = 'a';

            expect(state.isChanged()).toEqual(true);
            expect(state.changelog[0].oldKey).toEqual('1');
            expect(state.changelog[1].oldKey).toEqual(undefined);
            expect(state.changelog[2].oldKey).toEqual('0');

            done();
          });
        });

        it('works with resorted array object', (done) => {
          const array = ['b', 'a', 'c', 'a'];
          state = new State(array);

          window.requestAnimationFrame(() => {
            array.length = 0;
            array.push(...['a', 'b', 'a', 'b', 'a']);

            expect(state.isChanged()).toEqual(true);
            expect(state.changelog[0].oldKey).toEqual('1');
            expect(state.changelog[1].oldKey).toEqual('0');
            expect(state.changelog[2].oldKey).toEqual('3');
            expect(state.changelog[3].oldKey).toEqual(undefined);
            expect(state.changelog[4].oldKey).toEqual(undefined);

            done();
          });
        });
      });

      describe('`newKey` parameter', () => {
        beforeEach(() => {
          obj = { a: 1, b: 2, c: 3 };
          state = new State(obj);
        });

        it('is set for after relocation', (done) => {
          window.requestAnimationFrame(() => {
            obj.a = 0;
            obj.c = 1;

            expect(state.isChanged()).toEqual(true);
            expect(state.changelog.a.newKey).toEqual('c');
            done();
          });
        });

        it('is set for before relocation', (done) => {
          window.requestAnimationFrame(() => {
            obj.a = 3;
            obj.c = 0;

            expect(state.isChanged()).toEqual(true);
            expect(state.changelog.c.newKey).toEqual('a');
            done();
          });
        });
      });
    });
  });
});
