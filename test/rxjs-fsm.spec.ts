import { RxjsFsm } from '../lib';
import { expect, assert } from 'chai';
import 'mocha';
import { take, timeout, tap, mergeMap, switchMap } from 'rxjs/operators';
import { of, from, merge } from 'rxjs';

describe('RxjsFsm', () => {
  it('should create', () => {
    const fsm = new RxjsFsm();
    assert.isDefined(fsm);
  });

  it('should let you define a default state', () => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');
  });

  it('should allow us to toggle state', done => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');
    fsm
      .on('ON')
      .pipe(take(1))
      .subscribe(state => {
        expect(fsm.state).to.equal(state);
        expect(fsm.state).to.equal('ON');
        done();
      });
    fsm.send('TOUCH');
  });

  it('should allow us to reset', done => {
    const fsm = new RxjsFsm();
    fsm.add('OFF', [{ when: 'TOUCH', goto: 'ON' }]);
    fsm.add('ON', [{ when: 'TOUCH', goto: 'OFF' }]);
    fsm.init('OFF');
    expect(fsm.state).to.equal('OFF');

    const off$ = fsm.on('OFF');
    const on$ = fsm.on('ON');
    const events = [];

    merge(on$, off$).subscribe(next => {
      events.push(next);
      if (events.length == 2) {
        expect(events).to.eql(['ON', 'OFF']);
        done();
      }
    });
    fsm.send('TOUCH');
    fsm.send('TOUCH');
  });
});
