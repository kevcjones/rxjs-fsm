import { Observable } from 'rxjs';
export declare type FsmStateType = string | number;
export declare type FsmEventType = string | number;
export interface FsmTransition {
    when: FsmEventType;
    goto: FsmStateType;
}
export declare class RxFsm {
    private stateMap;
    private stateUpdate$;
    private defaultState;
    stateRead$: Observable<FsmStateType>;
    start(defaultState: FsmStateType): Observable<string | number>;
    init(): void;
    reset(): void;
    on(stateName: FsmStateType): Observable<FsmStateType>;
    send(eventName: string): void;
    transitions(stateName: FsmStateType): string[];
    onException(): Observable<FsmStateType>;
    add(name: FsmStateType, transitions: FsmTransition[]): any;
}
