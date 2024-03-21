import { ReadonlyArray } from "effect"
import { dual, pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Pipeable from "effect/Pipeable"
import * as Predicate from "effect/Predicate"
import type * as Lens from "../Lens.js"
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

/** @internal */
export const isOptional = (u: unknown): u is Optional.Optional<unknown, unknown> =>
  Predicate.hasProperty(u, TypeId) && Predicate.isObject(u[TypeId])

/** @internal */
export const id = <A>(): Optional.Optional<A, A> => make(Option.some, (_, value) => value)

/** @internal */
export const prop = (first: any, ...args: ReadonlyArray<string>): any => {
  if (isOptional(first)) {
    return _prop(first, args)
  }
  return (lens: Optional.Optional.Any) => _prop(lens, [first, ...args])
}

/** @internal */
const _getPropNested = (self: any, props: ReadonlyArray<string>) => {
  if (props.length === 1) {
    return self[props[0]]
  } else if (props.length === 2) {
    return self[props[0]][props[1]]
  } else if (props.length === 3) {
    return self[props[0]][props[1]][props[2]]
  } else if (props.length === 4) {
    return self[props[0]][props[1]][props[2]][props[3]]
  } else if (props.length === 5) {
    return self[props[0]][props[1]][props[2]][props[3]][props[4]]
  }

  let value = self
  for (const prop of props) {
    value = value[prop]
  }
  return value
}

/** @internal */
const _setPropNested = (self: any, value: any, [prop, ...props]: ReadonlyArray<string>) => {
  if (props.length === 0) {
    const oldValue = self[prop]

    if (oldValue === value) {
      return self
    }

    return Object.assign({}, self, { [prop]: value })
  }

  const oldValue = self[prop]
  const newValue: any = _setPropNested(oldValue, value, props)

  if (oldValue === newValue) {
    return self
  }

  return Object.assign({}, self, { [prop]: newValue })
}

/** @internal */
export const _prop = (optional: Optional.Optional.Any, props: ReadonlyArray<string>) => {
  return make(
    (self) => Option.map(optional.getOption(self), (value) => _getPropNested(value, props)),
    (self, value) => {
      const v = optional.getOption(self)

      if (Option.isNone(v)) {
        return self
      }

      return optional.set(v, _setPropNested(v.value, value, props))
    }
  )
}

/** @internal */
export const compose = dual(
  2,
  <A, B, C>(first: Optional.Optional<A, B>, second: Optional.Optional<B, C>): Optional.Optional<A, C> =>
    make(
      (self) => Option.flatMap(first.getOption(self), second.getOption),
      (self, value) => {
        const v = first.getOption(self)

        if (Option.isNone(v)) {
          return self
        }

        return first.set(self, second.set(v.value, value))
      }
    )
)

/** @internal */
export const append = (...args: ReadonlyArray<any>): any => {
  if (args.length === 3) {
    return _append(...(args as readonly [any, any, any]))
  }

  if (args.length !== 1) {
    throw new Error("Unexpected number of arguments")
  }

  return dual(2, <Self, A>(self: Self, last: A) => _append(args[0], self, last))
}

/** @internal */
const _append = <Self, A>(lens: Optional.Optional<Self, ReadonlyArray<A>>, self: Self, last: A): Self => {
  const v = lens.getOption(self)

  if (Option.isNone(v)) {
    return self
  }

  return lens.set(self, ReadonlyArray.append(v.value, last))
}

/** @internal */
export const appendAll = (...args: any): any => {
  if (args.length === 3) {
    return _appendAll(...(args as readonly [any, any, any]))
  }

  if (args.length !== 1) {
    throw new Error("Unexpected number of arguments")
  }

  return dual(2, <Self, A>(self: Self, last: ReadonlyArray<A>) => _appendAll(args[0], self, last))
}

/** @internal */
const _appendAll = <Self, A>(
  lens: Optional.Optional<Self, ReadonlyArray<A>>,
  self: Self,
  that: ReadonlyArray<A>
): Self => {
  const v = lens.getOption(self)

  if (Option.isNone(v)) {
    return self
  }

  return lens.set(self, ReadonlyArray.appendAll(v.value, that))
}

/** @internal */
export const headNonEmpty = <Self, A>(
  lens:
    | Optional.Optional<Self, ReadonlyArray.NonEmptyArray<A>>
    | Optional.Optional<Self, ReadonlyArray.NonEmptyReadonlyArray<A>>
) =>
  make<Self, A>(
    (self) => Option.map(lens.getOption(self), (arr) => arr[0]),
    (self, value) => {
      const v = lens.getOption(self)

      if (Option.isNone(v)) {
        return self
      }

      const [head, ...rest] = v.value

      if (head === value) {
        return self
      }

      return lens.set(self, [value, ...rest])
    }
  )

/** @internal */
export const filter: typeof Optional.filter = dual(2, <A, B extends A, Self>(
  lens: Optional.Optional<Self, A>,
  refinement: Predicate.Refinement<A, B>
): Optional.Optional<Self, B> =>
  make(
    (self) => pipe(lens.getOption(self), Option.filter(refinement)),
    (self, value) => {
      const v = lens.getOption(self)

      if (Option.isNone(v)) {
        return self
      }

      if (refinement(v.value)) {
        return lens.set(self, value)
      }

      return self
    }
  ))

/** @internal */
export const extract = dual(3 as any, <Self, Value, const Tag extends keyof Value, const TagValue extends Value[Tag]>(
  lens: Optional.Optional<Self, Value>,
  tag: Tag,
  tagValue: TagValue
): Optional.Optional<Self, Extract<Value, { [_ in Tag]: TagValue }>> =>
  filter(
    lens,
    (value): value is Extract<Value, { [K in Tag]: TagValue }> => value[tag] === tagValue
  ))

/** @internal */
export const composeLens = dual(
  2,
  <A, B, C>(selfOptional: Optional.Optional<A, B>, thatLens: Lens.Lens<B, C>): Optional.Optional<A, C> =>
    make(
      (self) => Option.map(selfOptional.getOption(self), thatLens.get),
      (self, value) => {
        const v = selfOptional.getOption(self)

        if (Option.isNone(v)) {
          return self
        }

        return selfOptional.set(self, thatLens.set(v.value, value))
      }
    )
)
