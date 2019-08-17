import { Observable, Subject } from 'rxjs';
import { filter, scan, share, startWith, tap } from 'rxjs/operators';

const EXCEPTION_STATE = '_exception_';
const HARD_RESET_EVENT = '_hard_reset_event_';

export type FsmStateType = string | number;
export type FsmEventType = string | number;
export interface FsmTransition {
  when: FsmEventType;
  goto: FsmStateType;
}

export class RxFsm {
  private stateMap: any;
  private stateUpdate$: Subject<FsmStateType>;
  private defaultState: FsmStateType;
  state: FsmStateType;
  stateRead$: Observable<FsmStateType>;

  start(defaultState: FsmStateType) {
    this.defaultState = defaultState;
    this.init();
  }

  init() {
    if (this.stateUpdate$) {
      this.stateUpdate$.complete();
    }
    this.stateUpdate$ = new Subject();
    this.stateRead$ = this.stateUpdate$.asObservable().pipe(
      startWith(this.defaultState),
      scan((machineState: FsmStateType, transition: string) => {
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

  on(stateName: FsmStateType): Observable<FsmStateType> {
    return this.stateRead$.pipe(filter(state => state === stateName));
  }

  send(eventName: string) {
    this.stateUpdate$.next(eventName);
  }

  transitions(stateName: FsmStateType) {
    if (!this.stateMap[stateName]) return [HARD_RESET_EVENT];
    return Object.keys(this.stateMap[stateName]);
  }

  onException(): Observable<FsmStateType> {
    return this.on(EXCEPTION_STATE);
  }

  add(name: FsmStateType, transitions: FsmTransition[]): any {
    if (!this.stateMap) {
      this.stateMap = {};
    }
    this.stateMap[name] = transitions.reduce((transitionMap, next) => {
      transitionMap[next.when] = next.goto;
      return transitionMap;
    }, {});
    return this;
  }
}
