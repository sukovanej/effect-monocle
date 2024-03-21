import { dual } from "effect/Function"
import type * as Option from "effect/Option"
import * as Pipeable from "effect/Pipeable"
import type * as Optional from "../Optional.js"

export const TypeId: Optional.TypeId = Symbol.for(
  "effect-monocle/Optional/TypeId"
) as Optional.TypeId

/** @internal */
const variance = {
  _Self: (_: any) => _,
  _Value: (_: any) => _
}

/** @internal */
class OptionalImpl<Self, Value> implements Optional.Optional<Self, Value> {
  readonly [TypeId] = variance

  constructor(
    readonly getOption: (self: Self) => Option.Option<Value>,
    readonly set: {
      (self: Self, value: Value): Self
      (value: Value): (self: Self) => Self
    }
  ) {}

  pipe() {
    // eslint-disable-next-line prefer-rest-params
    return Pipeable.pipeArguments(this, arguments)
  }
}

/** @internal */
export const make = <Self, Value>(
  get: (self: Self) => Option.Option<Value>,
  set: (self: Self, value: Value) => Self
): Optional.Optional<Self, Value> => new OptionalImpl(get, dual(2, set))
