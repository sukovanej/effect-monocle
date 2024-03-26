import { dual, identity, pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Predicate from "effect/Predicate"
import * as ReadonlyArray from "effect/ReadonlyArray"
import * as Struct from "effect/Struct"
import type * as Lens from "../Lens.js"
import * as Optional from "../Optional.js"
import * as circular from "./lens-circular.js"
import * as optional_circular from "./optional-circular.js"

export const TypeId: Lens.TypeId = circular.TypeId

/** @internal */
export const make = circular.make

/** @internal */
export const isLens = (u: unknown): u is Lens.Lens<unknown, unknown> =>
  Predicate.hasProperty(u, TypeId) && Predicate.isObject(u[TypeId])

/** @internal */
export const id = <A>(): Lens.Lens<A, A> => make(identity, (_, value) => value)

/** @internal */
export const prop = (first: any, ...args: ReadonlyArray<string>): any => {
  if (isLens(first)) {
    return _prop(first, args)
  }
  return (lens: Lens.Lens.Any) => _prop(lens, [first, ...args])
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

    const newSelf = Object.assign({}, self, { [prop]: value })
    Object.setPrototypeOf(newSelf, Object.getPrototypeOf(self))
    return newSelf
  }

  const oldValue = self[prop]
  const newValue: any = _setPropNested(oldValue, value, props)

  if (oldValue === newValue) {
    return self
  }

  const newSelf = Object.assign({}, self, { [prop]: newValue })
  Object.setPrototypeOf(newSelf, Object.getPrototypeOf(self))
  return newSelf
}

/** @internal */
export const _prop = (lens: Lens.Lens.Any, props: ReadonlyArray<string>) => {
  return make(
    (self) => _getPropNested(lens.get(self), props),
    (self, value) => lens.set(self, _setPropNested(lens.get(self), value, props))
  )
}

/** @internal */
export const compose = dual(
  2,
  <A, B, C>(first: Lens.Lens<A, B>, second: Lens.Lens<B, C>): Lens.Lens<A, C> =>
    make(
      (self) => second.get(first.get(self)),
      (self, value) => first.set(self, second.set(first.get(self), value))
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
const _append = <Self, A>(lens: Lens.Lens<Self, ReadonlyArray<A>>, self: Self, last: A): Self =>
  lens.set(self, ReadonlyArray.append(lens.get(self), last))

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
const _appendAll = <Self, A>(lens: Lens.Lens<Self, ReadonlyArray<A>>, self: Self, that: ReadonlyArray<A>): Self =>
  lens.set(self, ReadonlyArray.appendAll(lens.get(self), that))

/** @internal */
export const headNonEmpty = <Self, A>(
  lens: Lens.Lens<Self, ReadonlyArray.NonEmptyArray<A>> | Lens.Lens<Self, ReadonlyArray.NonEmptyReadonlyArray<A>>
) =>
  make<Self, A>((self) => lens.get(self)[0], (self, value) => {
    const [head, ...rest] = lens.get(self)

    if (head === value) {
      return self
    }

    return lens.set(self, [value, ...rest])
  })

/** @internal */
export const filter: typeof Lens.filter = dual(2, <A, B extends A, Self>(
  lens: Lens.Lens<Self, A>,
  refinement: Predicate.Refinement<A, B>
): Optional.Optional<Self, B> =>
  Optional.make(
    (self) => pipe(lens.get(self), Option.liftPredicate(refinement)),
    (self, value) => {
      const old = lens.get(self)

      if (refinement(old)) {
        return lens.set(self, value)
      }

      return self
    }
  ))

/** @internal */
export const extract = (first: any, ...args: readonly [any, ...Array<any>]): any => {
  if (isLens(first)) {
    // @ts-expect-error
    return _extract(first, ...args)
  }

  return (lens: Lens.Lens.Any) => _extract(lens, first, ...args)
}

/** @internal */
const _extract = <
  Self,
  Value,
  const Tag extends keyof Value,
  const TagValues extends readonly [Value[Tag], ...Array<Value[Tag]>]
>(
  lens: Lens.Lens<Self, Value>,
  tag: Tag,
  ...tagValues: TagValues
): Optional.Optional<Self, Extract<Value, { [_ in Tag]: TagValues[number] }>> =>
  filter(
    lens,
    (value): value is Extract<Value, { [K in Tag]: TagValues[number] }> => tagValues.includes(value[tag])
  )

/** @internal */
export const some = <A, B>(that: Lens.Lens<A, Option.Option<B>>): Optional.Optional<A, B> =>
  optional_circular.make(
    (self) => that.get(self),
    (self, value) => {
      const v = that.get(self)

      if (Option.isNone(v)) {
        return self
      }

      return that.set(self, Option.some(value))
    }
  )

/** @internal */
export const pick = (...args: ReadonlyArray<any>): any => {
  if (isLens(args[0])) {
    return _pick(...(args as readonly [any, any]))
  }

  return (lens: Lens.Lens.Any) => _pick(lens, args)
}

/** @internal */
const _pick = <Self, Value>(
  lens: Lens.Lens<Self, Value>,
  keys: ReadonlyArray<string>
) =>
  make<Self, Value>(
    // @ts-expect-error
    (self) => Struct.pick(lens.get(self), ...keys),
    (self, value) => {
      const v = lens.get(self)
      return lens.set(self, { ...v, ...value })
    }
  )
