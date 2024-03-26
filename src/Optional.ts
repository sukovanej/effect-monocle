/**
 * Zoom into an object.
 *
 * @since 1.0.0
 */

import type * as Lens from "effect-monocle/Lens"
import type * as Option from "effect/Option"
import type * as Pipeable from "effect/Pipeable"
import type * as Predicate from "effect/Predicate"
import type * as ReadonlyArray from "effect/ReadonlyArray"
import type * as Types from "effect/Types"
import * as internal from "./internal/optional.js"

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
export interface Optional<Self, Value> extends Optional.Variance<Self, Value>, Pipeable.Pipeable {
  readonly getOption: (self: Self) => Option.Option<Value>
  readonly set: {
    (self: Self, value: Value): Self
    (value: Value): (self: Self) => Self
  }
}

/**
 * @category models
 * @since 1.0.0
 */
export declare namespace Optional {
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
  export type Any = Optional<any, any>
}

/**
 * @category constructors
 * @since 1.0.0
 */
export const make: <Self, Value>(
  get: (self: Self) => Option.Option<Value>,
  set: (self: Self, value: Value) => Self
) => Optional<Self, Value> = internal.make

/**
 * @category constructors
 * @since 1.0.0
 */
export const id: <Self>() => Optional<Self, Self> = internal.id

/**
 * @category struct
 * @since 1.0.0
 */
export const prop: {
  <Value, A extends keyof Value>(prop: A): <Self>(lens: Optional<Self, Value>) => Optional<Self, Value[A]>
  <Value, A extends keyof Value, B extends keyof Value[A]>(
    a: A,
    b: B
  ): <Self>(lens: Optional<Self, Value>) => Optional<Self, Value[A][B]>
  <Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B]>(
    a: A,
    b: B,
    c: C
  ): <Self>(lens: Optional<Self, Value>) => Optional<Self, Value[A][B][C]>

  <Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B], D extends keyof Value[A][B][C]>(
    a: A,
    b: B,
    c: C,
    d: D
  ): <Self>(lens: Optional<Self, Value>) => Optional<Self, Value[A][B][C][D]>
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
  ): <Self>(lens: Optional<Self, Value>) => Optional<Self, Value[A][B][C][D][E]>

  <Self, Value, A extends keyof Value>(lens: Optional<Self, Value>, a: A): Optional<Self, Value[A]>
  <Self, Value, A extends keyof Value, B extends keyof Value[A]>(
    lens: Optional<Self, Value>,
    a: A,
    b: B
  ): Optional<Self, Value[A][B]>
  <Self, Value, A extends keyof Value, B extends keyof Value[A], C extends keyof Value[A][B]>(
    lens: Optional<Self, Value>,
    a: A,
    b: B,
    c: C
  ): Optional<Self, Value[A][B][C]>
  <
    Self,
    Value,
    A extends keyof Value,
    B extends keyof Value[A],
    C extends keyof Value[A][B],
    D extends keyof Value[A][B][C]
  >(
    lens: Optional<Self, Value>,
    a: A,
    b: B,
    c: C,
    d: D
  ): Optional<Self, Value[A][B][C][D]>
  <
    Self,
    Value,
    A extends keyof Value,
    B extends keyof Value[A],
    C extends keyof Value[A][B],
    D extends keyof Value[A][B][C],
    E extends keyof Value[A][B][C][D]
  >(
    lens: Optional<Self, Value>,
    a: A,
    b: B,
    c: C,
    d: D,
    e: E
  ): Optional<Self, Value[A][B][C][D][E]>
} = internal.prop

/**
 * @category composition
 * @since 1.0.0
 */
export const compose: {
  <B, C>(that: Optional<B, C>): <A>(self: Optional<A, B>) => Optional<A, C>
  <A, B, C>(self: Optional<A, B>, that: Optional<B, C>): Optional<A, C>
} = internal.compose

/**
 * @category composition
 * @since 1.0.0
 */
export const composeLens: {
  <B, C>(that: Lens.Lens<B, C>): <A>(self: Optional<A, B>) => Optional<A, C>
  <A, B, C>(self: Optional<A, B>, that: Lens.Lens<B, C>): Optional<A, C>
} = internal.composeLens

/**
 * @category option
 * @since 1.0.0
 */
export const some: <A, B>(optional: Optional<A, Option.Option<B>>) => Optional<A, B> = internal.some

/**
 * @category array
 * @since 1.0.0
 */
export const append: {
  <Self, A>(lens: Optional<Self, ReadonlyArray<A>> | Optional<Self, Array<A>>, self: Self, last: A): Self
  <Self, A>(lens: Optional<Self, ReadonlyArray<A>> | Optional<Self, Array<A>>): {
    (self: Self, last: A): Self
    (last: A): (self: Self) => Self
  }
} = internal.append

/**
 * @category array
 * @since 1.0.0
 */
export const appendAll: {
  <Self, A>(lens: Optional<Self, ReadonlyArray<A>> | Optional<Self, Array<A>>, self: Self, that: ReadonlyArray<A>): Self
  <Self, A>(lens: Optional<Self, ReadonlyArray<A>> | Optional<Self, Array<A>>): {
    (self: Self, that: ReadonlyArray<A>): Self
    (that: ReadonlyArray<A>): (self: Self) => Self
  }
} = internal.appendAll

/**
 * @category array
 * @since 1.0.0
 */
export const headNonEmpty: <Self, A>(
  lens: Optional<Self, ReadonlyArray.NonEmptyReadonlyArray<A>> | Optional<Self, ReadonlyArray.NonEmptyArray<A>>
) => Optional<Self, A> = internal.headNonEmpty

/**
 * @category combinators
 * @since 1.0.0
 */
export const filter: {
  <A, B extends A, Self>(lens: Optional<Self, A>, refinement: Predicate.Refinement<A, B>): Optional<Self, B>
  <A, B extends A>(
    refinement: Predicate.Refinement<A, B>
  ): <Self>(lens: Optional<Self, A>) => Optional<Self, B>

  <A, Self>(lens: Optional<Self, A>, predicate: Predicate.Predicate<A>): Optional<Self, A>
  <A>(predicate: Predicate.Predicate<A>): <Self>(lens: Optional<Self, A>) => Optional<Self, A>
} = internal.filter

/**
 * @category struct
 * @since 1.0.0
 */
export const extract: {
  <Self, Value, const Tag extends keyof Value, const TagValues extends readonly [Value[Tag], ...Array<Value[Tag]>]>(
    lens: Optional<Self, Value>,
    tag: Tag,
    ...tagValues: TagValues
  ): Optional<Self, Extract<Value, { [K in Tag]: TagValues[number] }>>

  <Value, const Tag extends keyof Value, const TagValues extends readonly [Value[Tag], ...Array<Value[Tag]>]>(
    tag: Tag,
    ...tagValues: TagValues
  ): <Self>(lens: Optional<Self, Value>) => Optional<Self, Extract<Value, { [K in Tag]: TagValues[number] }>>
} = internal.extract
