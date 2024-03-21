import { Option, pipe } from "effect"
import type { Lens, Optional } from "effect-monocle"
import { expect } from "vitest"

export const testOptionalLaws = <Self, Value>(
  optional: Optional.Optional<Self, Value>,
  ...args: Array<[self: Self, value: Value]>
) => {
  for (const [self, value] of args) {
    expect(
      Option.match(
        optional.getOption(self),
        { onNone: () => self, onSome: (value) => optional.set(self, value) }
      ),
      "Optional law 1"
    ).toEqual(self)

    expect(optional.getOption(optional.set(self, value)), "Optional law 2").toEqual(
      pipe(optional.getOption(self), Option.as(value))
    )

    expect(
      optional.set(optional.set(self, value), value),
      "Optional law 3"
    ).toEqual(optional.set(self, value))
  }
}

export const testLensLaws = <Self, Value>(
  lens: Lens.Lens<Self, Value>,
  ...args: Array<[self: Self, value: Value]>
) => {
  for (const [self, value] of args) {
    expect(lens.get(lens.set(self, value)), "Lens law 1").toEqual(value)

    expect(lens.set(self, lens.get(self)), "Lens law 2").toEqual(self)

    expect(lens.set(lens.set(self, value), value), "Lens law 3").toEqual(lens.set(self, value))
  }
}
