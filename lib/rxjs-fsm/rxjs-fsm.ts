import { Observable, Subject } from 'rxjs';
import { filter, scan, share, startWith, tap } from 'rxjs/operators';

const EXCEPTION_STATE = '_exception_';
const HARD_RESET_EVENT = '_hard_reset_event_';

export type RxjsFsmStateType = string | number;
export type RxjsFsmEventType = string | number;
export interface RxjsFsmTransition {
  when: RxjsFsmEventType;
  goto: RxjsFsmStateType;
}

export class RxjsFsm {
  private stateMap: any;
  private stateUpdate$: Subject<RxjsFsmStateType>;
  private defaultState: RxjsFsmStateType;
  state: RxjsFsmStateType;
  stateRead$: Observable<RxjsFsmStateType>;

  init(defaultState: RxjsFsmStateType) {
    this.defaultState = defaultState;
    this.state = defaultState;
    this.create();
  }

  private create() {
    if (this.stateUpdate$) {
      this.stateUpdate$.complete();
    }
    this.stateUpdate$ = new Subject();
    this.stateRead$ = this.stateUpdate$.asObservable().pipe(
      startWith(this.defaultState),
      scan((machineState: RxjsFsmStateType, transition: string) => {
        if (transition === HARD_RESET_EVENT) return this.defaultState;
        const nextMachineState = this.stateMap[machineState][transition];
        return nextMachineState ? nextMachineState : EXCEPTION_STATE;
      }),
      tap(res => (this.state = res)),
      share()
    );
  }

  reset() {
    this.stateUpdate$.next(HARD_RESET_EVENT);
  }

  on(stateName: RxjsFsmStateType): Observable<RxjsFsmStateType> {
    return this.stateRead$.pipe(filter(state => state === stateName));
  }

  send(eventName: string) {
    this.stateUpdate$.next(eventName);
  }

  listTransitions(stateName: RxjsFsmStateType) {
    if (!this.stateMap[stateName]) return [HARD_RESET_EVENT];
    return Object.keys(this.stateMap[stateName]);
  }

  onException(): Observable<RxjsFsmStateType> {
    return this.on(EXCEPTION_STATE);
  }

  add(name: RxjsFsmStateType, transitions: RxjsFsmTransition[]): any {
    if (!this.stateMap) {
      this.stateMap = {};
    }
    this.stateMap[name] = transitions.reduce((transitionMap, next) => {
      transitionMap[next.when] = next.goto;
      return transitionMap;
    }, {});
    return this;
  }

  remove(name: RxjsFsmStateType) {
    if (!this.stateMap && this.stateMap[name]) {
      return;
    }

    // delete the state
    delete this.stateMap[name];

    // clean up the states with transitions to this one
    Object.keys(this.stateMap).forEach(state => {
      const stateRef = this.stateMap[state];
      Object.keys(stateRef).forEach(transition => {
        if (stateRef[transition] === name) {
          delete stateRef[transition];
        }
      });
    });
  }
}
