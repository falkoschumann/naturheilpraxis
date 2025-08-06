// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { type Reducer, useCallback, useReducer, useRef } from "react";

export type FluxStandardAction<T extends string = string, P = unknown> = {
  type: T;
  payload: P;
  error?: boolean;
};

export interface ThunkDispatch<S, A> {
  <R>(action: ThunkAction<R, S, A>): R;

  <A>(action: A): void;

  <R>(action: A | ThunkAction<R, S, A>): void | R;
}

export type ThunkAction<R, S, A> = (
  dispatch: ThunkDispatch<S, A>,
  getState: () => S,
) => R;

export function useThunkReducer<S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
): [S, ThunkDispatch<S, A>];
export function useThunkReducer<S, I, A>(
  reducer: Reducer<S, A>,
  initialState: I,
  init?: (i: I) => S,
): [S, ThunkDispatch<S, A>];
export function useThunkReducer<S, I, A>(
  reducer: Reducer<S, A>,
  initialState: S | I,
  init?: (i: I) => S,
): [S, ThunkDispatch<S, A>] {
  const [state, dispatch] = useReducer(reducer, initialState as I, init!);

  const stateRef = useRef(state);
  stateRef.current = state;

  const getState = useCallback(() => stateRef.current, []);

  const thunkDispatch = useCallback(
    <R>(action: A | ThunkAction<R, S, A>): R | void => {
      if (typeof action === "function") {
        const thunk = action as ThunkAction<R, S, A>;
        return thunk(thunkDispatch, getState);
      }

      dispatch(action);
    },
    [getState],
  );

  return [state, thunkDispatch];
}

export class Store<S, A> {
  static create<S, A>(reducer: Reducer<S, A>, initialState: S): Store<S, A>;
  static create<S, I, A>(
    reducer: Reducer<S, A>,
    initialState: I,
    init: (i: I) => S,
  ): Store<S, A>;
  static create<S, I, A>(
    reducer: Reducer<S, A>,
    initialState: I | S,
    init?: (i: I) => S,
  ): Store<S, A> {
    return new Store(
      reducer,
      init ? init(initialState as I) : (initialState as S),
    );
  }

  readonly #reducer: Reducer<S, A>;
  #state: S;
  #log: S[] = [];
  #listeners: ListenerCallback[] = [];

  constructor(reducer: Reducer<S, A>, initialState: S) {
    this.#reducer = reducer;
    this.#state = initialState;
    this.#log.push(initialState);
  }

  dispatch<R>(action: A | ThunkAction<R, S, A>): void | R {
    if (typeof action === "function") {
      const thunk = action as ThunkAction<R, S, A>;
      return thunk(this.dispatch.bind(this), this.getState.bind(this));
    }

    const oldState = this.#state;
    this.#state = this.#reducer(this.getState(), action);
    this.#log.push(this.#state);
    if (oldState !== this.#state) {
      this.#emitChange();
    }
  }

  getState(): S {
    return this.#state;
  }

  subscribe(listener: ListenerCallback): Unsubscribe {
    this.#listeners.push(listener);
    return () => this.#unsubscribe(listener);
  }

  getLog(): S[] {
    return this.#log;
  }

  #emitChange() {
    this.#listeners.forEach((listener) => {
      // Unsubscribe replace listener's array with a new array, so we have to
      // double-check if listener is still subscribed.
      if (this.#listeners.includes(listener)) {
        listener();
      }
    });
  }

  #unsubscribe(listener: ListenerCallback) {
    this.#listeners = this.#listeners.filter((l) => l !== listener);
  }
}

type ListenerCallback = () => void;

type Unsubscribe = () => void;
