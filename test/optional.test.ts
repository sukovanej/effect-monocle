import { Option, pipe } from "effect"
import { Optional } from "effect-monocle"
import { expect, test } from "vitest"
import { testOptionalLaws } from "./laws.js"

const obj = {
  type: "obj1" as const,
  prop: 1,
  another: {
    hello: "world"
  },
  super: {
    nested: {
      data: {
        structure: Option.some(69)
      }
    }
  },
  values: [1, 2],
  valuesNonEmpty: [1, 2] as [number, ...Array<number>]
}

type Obj = typeof obj
type Super = Obj["super"]

const objOptional = Optional.id<Obj>()
const superOptional = Optional.id<Super>()

test.each(
  [
    {
      propOptional: Optional.prop(objOptional, "prop"),
      helloOptional: Optional.prop(objOptional, "another", "hello"),
      dataOptional: Optional.prop(objOptional, "super", "nested", "data"),
      structureOptional: Optional.prop(objOptional, "super", "nested", "data", "structure")
    },
    {
      propOptional: pipe(objOptional, Optional.prop("prop")),
      helloOptional: pipe(objOptional, Optional.prop("another", "hello")),
      dataOptional: pipe(objOptional, Optional.prop("super", "nested", "data")),
      structureOptional: pipe(objOptional, Optional.prop("super", "nested", "data", "structure"))
    }
  ] as const
)(
  "prop",
  (
    {
      dataOptional,
      helloOptional,
      propOptional,
      structureOptional
    }
  ) => {
    expect(propOptional.set(obj, 2)).toStrictEqual({ ...obj, prop: 2 })
    expect(pipe(obj, propOptional.set(2))).toStrictEqual({ ...obj, prop: 2 })

    testOptionalLaws(propOptional, [obj, 2])

    expect(helloOptional.set(obj, "patrik")).toEqual({ ...obj, another: { hello: "patrik" } })
    expect(pipe(obj, helloOptional.set("patrik"))).toEqual({ ...obj, another: { hello: "patrik" } })

    testOptionalLaws(helloOptional, [obj, "patrik"])

    expect(dataOptional.set(obj, { structure: Option.some(1) })).toEqual({
      ...obj,
      super: { nested: { data: { structure: Option.some(1) } } }
    })
    expect(pipe(obj, dataOptional.set({ structure: Option.some(1) }))).toEqual({
      ...obj,
      super: { nested: { data: { structure: Option.some(1) } } }
    })

    testOptionalLaws(dataOptional, [obj, { structure: Option.some(1) }])

    expect(structureOptional.set(obj, Option.some(1))).toEqual({
      ...obj,
      super: { nested: { data: { structure: Option.some(1) } } }
    })
    expect(pipe(obj, structureOptional.set(Option.some(1)))).toEqual({
      ...obj,
      super: { nested: { data: { structure: Option.some(1) } } }
    })

    testOptionalLaws(structureOptional, [obj, Option.some(1)])
  }
)

test.each(
  [
    Optional.compose(
      Optional.prop(objOptional, "super"),
      Optional.prop(superOptional, "nested", "data", "structure")
    ),
    pipe(
      Optional.prop(objOptional, "super"),
      Optional.compose(Optional.prop(superOptional, "nested", "data", "structure"))
    )
  ] as const
)("compose", (optional) => {
  expect(optional.set(obj, Option.some(-1))).toEqual({
    ...obj,
    super: { nested: { data: { structure: Option.some(-1) } } }
  })
  expect(pipe(obj, optional.set(Option.some(-1)))).toEqual({
    ...obj,
    super: { nested: { data: { structure: Option.some(-1) } } }
  })

  testOptionalLaws(optional, [obj, Option.some(-1)])
})

test("append", () => {
  const valuesOptional = Optional.prop(objOptional, "values")
  const appendValue = Optional.append(valuesOptional)

  expect(Optional.append(valuesOptional, obj, 3)).toEqual({ ...obj, values: [1, 2, 3] })

  expect(appendValue(obj, 3)).toEqual({ ...obj, values: [1, 2, 3] })
  expect(pipe(obj, appendValue(3))).toEqual({ ...obj, values: [1, 2, 3] })
})

test("appendAll", () => {
  const valuesOptional = Optional.prop(objOptional, "values")
  const appendValue = Optional.appendAll(valuesOptional)

  expect(Optional.appendAll(valuesOptional, obj, [3, 4])).toEqual({ ...obj, values: [1, 2, 3, 4] })

  expect(appendValue(obj, [3, 4])).toEqual({ ...obj, values: [1, 2, 3, 4] })
  expect(pipe(obj, appendValue([3, 4]))).toEqual({ ...obj, values: [1, 2, 3, 4] })
})

test("headNonEmpty", () => {
  const optional = Optional.headNonEmpty(Optional.prop(objOptional, "valuesNonEmpty"))

  expect(optional.getOption(obj)).toEqual(Option.some(1))
  expect(optional.set(obj, 3)).toEqual({ ...obj, valuesNonEmpty: [3, 2] })

  testOptionalLaws(optional, [obj, 3])

  const optional2 = Optional.prop(objOptional, "valuesNonEmpty").pipe(Optional.headNonEmpty)

  expect(optional2.getOption(obj)).toEqual(Option.some(1))
  expect(optional2.set(obj, 3)).toEqual({ ...obj, valuesNonEmpty: [3, 2] })

  testOptionalLaws(optional, [obj, 3])
})

const obj2 = {
  type: "obj2" as const,
  another: {
    property: "hello"
  }
}

type Obj2 = typeof obj2

test("extract", () => {
  const myObj = {
    value: obj as Obj | Obj2
  }

  const myObj2 = {
    value: obj2 as Obj | Obj2
  }

  const optional = pipe(
    Optional.id<typeof myObj>(),
    Optional.prop("value"),
    Optional.extract("type", "obj1"),
    Optional.prop("valuesNonEmpty")
  )

  expect(optional.getOption(myObj)).toEqual(Option.some(obj.values))
  expect(optional.getOption(myObj2)).toEqual(Option.none())

  expect(optional.set(myObj, [1])).toStrictEqual({ value: { ...obj, valuesNonEmpty: [1] } })
  expect(optional.set(myObj2, [1])).toStrictEqual(myObj2)

  testOptionalLaws(optional, [myObj, [1] as const], [myObj2, [1] as const])
})

test("some", () => {
  const obj1 = { value: Option.some("a") }
  const obj2 = { value: Option.none() }

  const optional = pipe(
    Optional.id<typeof obj1>(),
    Optional.prop("value"),
    Optional.some
  )

  expect(optional.set(obj1, "b")).toEqual({ value: Option.some("b") })
  expect(optional.set(obj2, "b")).toEqual({ value: Option.none() })

  expect(optional.getOption(obj1)).toEqual(Option.some("a"))
  expect(optional.getOption(obj2)).toEqual(Option.none())

  testOptionalLaws(optional, [obj1, "b"], [obj2, "b"])
})

test("nested set works", () => {
  const a = { a: { b: { c: 1 } } }
  const optional = pipe(Optional.id<typeof a>(), Optional.prop("a"), Optional.prop("b"))

  expect(optional.set(a, { c: 2 })).toEqual({ a: { b: { c: 2 } } })

  testOptionalLaws(optional, [a, { c: 2 }])
})

test("extract by multiple values", () => {
  type A = { type: "a"; value: number } | { type: "b"; value: number } | { type: "c"; another: string }

  const optional = pipe(Optional.id<A>(), Optional.extract("type", "a", "b"), Optional.prop("value"))

  const a: A = { type: "a", value: 68 }
  const b: A = { type: "b", value: 68 }
  const c: A = { type: "c", another: "str" }

  expect(optional.getOption(a)).toEqual(Option.some(68))
  expect(optional.set(a, 69)).toEqual({ type: "a", value: 69 })

  expect(optional.getOption(b)).toEqual(Option.some(68))
  expect(optional.set(b, 69)).toEqual({ type: "b", value: 69 })

  expect(optional.getOption(c)).toEqual(Option.none())
  expect(optional.set(c, 69)).toEqual({ type: "c", another: "str" })

  testOptionalLaws(optional, [a, 69], [b, 69], [c, 69])
})
