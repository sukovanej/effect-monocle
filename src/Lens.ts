/**
 * Zoom into an object.
 *
 * @since 1.0.0
 */

import type * as Option from "effect/Option"
import type * as Pipeable from "effect/Pipeable"
import type * as Predicate from "effect/Predicate"
import type * as ReadonlyArray from "effect/ReadonlyArray"
import type * as Types from "effect/Types"
import * as internal from "./internal/lens.js"
import type * as Optional from "./Optional.js"

/**
 * @since 1.0.0
 * @category type id
 */
export const TypeId: unique symbol = internal.TypeId

/**
 * @since 1.0.0
 * @category type id
 */
export type TypeId = typeof TypeId

/**
 * @category models
 * @since 1.0.0
 */
export interface Lens<Self, Value> extends Lens.Variance<Self, Value>, Pipeable.Pipeable {
  readonly get: (self: Self) => Value
  readonly set: {
    (self: Self, value: Value): Self
    (value: Value): (self: Self) => Self
  }

  // derived
  readonly modify: {
    (self: Self, f: (value: Value) => Value): Self
    (f: (value: Value) => Value): (self: Self) => Self
  }
}

/**
 * @category models
 * @since 1.0.0
 */
export declare namespace Lens {
  /**
   * @category models
   * @since 1.0.0
   */
  export interface Variance<Self, Value> {
    readonly [TypeId]: {
      readonly _Self: Types.Invariant<Self>
      readonly _Value: Types.Invariant<Value>
    }
  }

  /**
   * @category models
   * @since 1.0.0
   */
  export type Any = Lens<any, any>
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const make: <Self, Value>(
  get: (self: Self) => Value,
  set: (self: Self, value: Value) => Self
) => Lens<Self, Value> = internal.make

/**
 * @category constructors
 * @since 1.0.0
 */
export const id: <Self>() => Lens<Self, Self> = internal.id

/**
 * @category struct
 * @since 1.0.0
 */
export const prop: {
  <Value, A extends keyof Value>(prop: A): <Self>(lens: Lens<Self, Value>) => Lens<Self, Value[A]>
  <Value, A extends keyof Value, B extends keyof Value[A]>(
    a: A,
    b: B
  ): <Self>(lens: Lens<Self, Value>) => Lens<Self, Value[A][B]>
  <Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B]>(
    a: A,
    b: B,
    c: C
  ): <Self>(lens: Lens<Self, Value>) => Lens<Self, Value[A][B][C]>

  <Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B], D extends keyof Value[A][B][C]>(
    a: A,
    b: B,
    c: C,
    d: D
  ): <Self>(lens: Lens<Self, Value>) => Lens<Self, Value[A][B][C][D]>
  <
    Value,
    A extends keyof Value,
    B extends keyof Value[A],
    C extends keyof Value[A][B],
    D extends keyof Value[A][B][C],
    E extends keyof Value[A][B][C][D]
  >(
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): <Self>(lens: Lens<Self, Value>) => Lens<Self, Value[A][B][C][D][E]>

  <Self, Value, A extends keyof Value>(lens: Lens<Self, Value>, a: A): Lens<Self, Value[A]>
  <Self, Value, A extends keyof Value, B extends keyof Value[A]>(
    lens: Lens<Self, Value>,
    a: A,
    b: B
  ): Lens<Self, Value[A][B]>
  <Self, Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B]>(
    lens: Lens<Self, Value>,
    a: A,
    b: B,
    c: C
  ): Lens<Self, Value[A][B][C]>
  <
    Self,
    Value,
    A extends keyof Value,
    B extends keyof Value[A],
    C extends keyof Value[A][B],
    D extends keyof Value[A][B][C]
  >(
    lens: Lens<Self, Value>,
    a: A,
    b: B,
    c: C,
    d: D
  ): Lens<Self, Value[A][B][C][D]>
  <
    Self,
    Value,
    A extends keyof Value,
    B extends keyof Value[A],
    C extends keyof Value[A][B],
    D extends keyof Value[A][B][C],
    E extends keyof Value[A][B][C][D]
  >(
    lens: Lens<Self, Value>,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): Lens<Self, Value[A][B][C][D][E]>
} = internal.prop

/**
 * @category composition
 * @since 1.0.0
 */
export const compose: {
  <B, C>(that: Lens<B, C>): <A>(self: Lens<A, B>) => Lens<A, C>
  <A, B, C>(self: Lens<A, B>, that: Lens<B, C>): Lens<A, C>
} = internal.compose

/**
 * @category option
 * @since 1.0.0
 */
export const some: <A, B>(lens: Lens<A, Option.Option<B>>) => Optional.Optional<A, B> = internal.some

/**
 * @category array
 * @since 1.0.0
 */
export const append: {
  <Self, A>(
    lens: Lens<Self, ReadonlyArray.NonEmptyArray<A>> | Lens<Self, ReadonlyArray<A>> | Lens<Self, Array<A>>,
    self: Self,
    last: A
  ): Self
  <Self, A>(lens: Lens<Self, ReadonlyArray.NonEmptyArray<A>> | Lens<Self, ReadonlyArray<A>> | Lens<Self, Array<A>>): {
    (self: Self, last: A): Self
    (last: A): (self: Self) => Self
  }
} = internal.append

/**
 * @category array
 * @since 1.0.0
 */
export const appendAll: {
  <Self, A>(lens: Lens<Self, ReadonlyArray<A>> | Lens<Self, Array<A>>, self: Self, that: ReadonlyArray<A>): Self
  <Self, A>(lens: Lens<Self, ReadonlyArray<A>> | Lens<Self, Array<A>>): {
    (self: Self, that: ReadonlyArray<A>): Self
    (that: ReadonlyArray<A>): (self: Self) => Self
  }
} = internal.appendAll

/**
 * @category array
 * @since 1.0.0
 */
export const headNonEmpty: <Self, A>(
  lens: Lens<Self, ReadonlyArray.NonEmptyReadonlyArray<A>> | Lens<Self, ReadonlyArray.NonEmptyArray<A>>
) => Lens<Self, A> = internal.headNonEmpty

/**
 * @category combinators
 * @since 1.0.0
 */
export const filter: {
  <A, B extends A, Self>(lens: Lens<Self, A>, refinement: Predicate.Refinement<A, B>): Optional.Optional<Self, B>
  <A, B extends A>(refinement: Predicate.Refinement<A, B>): <Self>(lens: Lens<Self, A>) => Optional.Optional<Self, B>

  <A, Self>(lens: Lens<Self, A>, predicate: Predicate.Predicate<A>): Optional.Optional<Self, A>
  <A>(predicate: Predicate.Predicate<A>): <Self>(lens: Lens<Self, A>) => Optional.Optional<Self, A>
} = internal.filter

/**
 * @category struct
 * @since 1.0.0
 */
export const extract: {
  <Self, Value, const Tag extends keyof Value, const TagValues extends readonly [Value[Tag], ...Array<Value[Tag]>]>(
    lens: Lens<Self, Value>,
    tag: Tag,
    ...tagValue: TagValues
  ): Optional.Optional<Self, Extract<Value, { [K in Tag]: TagValues[number] }>>

  <Value, const Tag extends keyof Value, const TagValues extends readonly [Value[Tag], ...Array<Value[Tag]>]>(
    tag: Tag,
    ...tagValue: TagValues
  ): <Self>(lens: Lens<Self, Value>) => Optional.Optional<Self, Extract<Value, { [K in Tag]: TagValues[number] }>>
} = internal.extract

/**
 * `L.props` alternative
 *
 * @category struct
 * @since 1.0.0
 */
export const pick: {
  <Value, Keys extends keyof Value>(
    ...keys: readonly [Keys, Keys, ...ReadonlyArray<Keys>]
  ): <Self>(lens: Lens<Self, Value>) => Lens<Self, { [K in Keys]: Value[K] }>

  <Self, Value, Keys extends keyof Value>(
    lens: Lens<Self, Value>,
    ...keys: readonly [Keys, Keys, ...ReadonlyArray<Keys>]
  ): Lens<Self, { [K in Keys]: Value[K] }>
} = internal.pick
