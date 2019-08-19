import { Observable, Subject, BehaviorSubject } from 'rxjs';
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
  private stateUpdate$: BehaviorSubject<RxjsFsmStateType>;
  private defaultState: RxjsFsmStateType;
  stateRead$: Observable<RxjsFsmStateType>;

  init(defaultState: RxjsFsmStateType) {
    this.defaultState = defaultState;
    this.create();
  }

  private create() {
    if (this.stateUpdate$) {
      this.stateUpdate$.complete();
    }
    this.stateUpdate$ = new BehaviorSubject(this.defaultState);
    this.stateRead$ = this.stateUpdate$.asObservable().pipe(share());
  }

  private injectEvent(event: string) {
    const nextMachineState =
      event === HARD_RESET_EVENT
        ? this.defaultState
        : this.stateMap[this.stateUpdate$.value][event] || EXCEPTION_STATE;
    this.stateUpdate$.next(nextMachineState);
  }

  get state() {
    return this.stateUpdate$.value;
  }

  reset() {
    this.injectEvent(HARD_RESET_EVENT);
    return this.stateUpdate$.value !== EXCEPTION_STATE;
  }

  on(stateName: RxjsFsmStateType): Observable<RxjsFsmStateType> {
    return this.stateRead$.pipe(filter(state => state === stateName));
  }

  send(eventName: string) {
    this.injectEvent(eventName);
    return this.stateUpdate$.value !== EXCEPTION_STATE;
  }

  listTransitions(stateName?: RxjsFsmStateType) {
    if (!this.stateMap[stateName || this.state]) return [HARD_RESET_EVENT];
    return Object.keys(this.stateMap[stateName || this.state]);
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
    if (!this.stateMap || !this.stateMap[name]) {
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
