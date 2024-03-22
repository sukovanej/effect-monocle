import { dual } from "effect/Function"
import * as Pipeable from "effect/Pipeable"
import type * as Lens from "../Lens.js"

export const TypeId: Lens.TypeId = Symbol.for(
  "effect-monocle/Lens/TypeId"
) as Lens.TypeId

/** @internal */
const variance = {
  _Self: (_: any) => _,
  _Value: (_: any) => _
}

/** @internal */
export class LensImpl<Self, Value> implements Lens.Lens<Self, Value> {
  readonly [TypeId] = variance

  constructor(
    readonly get: (self: Self) => Value,
    readonly set: {
      (self: Self, value: Value): Self
      (value: Value): (self: Self) => Self
    }
  ) {}

  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }

  get modify() {
    return dual(2, (self: Self, f: (value: Value) => Value) => {
      const currentValue = this.get(self)
      const newValue = f(currentValue)
      return currentValue === newValue ? self : this.set(newValue)(self)
    })
  }
}

/** @internal */
export const make = <Self, Value>(
  get: (self: Self) => Value,
  set: (self: Self, value: Value) => Self
): Lens.Lens<Self, Value> => new LensImpl(get, dual(2, set))
