# effect-monocle

Hey there! This is a library aiming to provide [monocle-ts](https://github.com/gcanti/monocle-ts) API
for [effect](https://effect.website/) codebases. My motivation for creating it was to make transition
from fp-ts to effect easier because we rely heavily on monocle-ts in our codebase.

The overall tendency in the effect ecosystem is to ditch the optics whatsoever. I'm mostly
aligned with this view, so I'd like to emphasize that this library's main goal is to provide
a smooth transition path for those who are already using monocle-ts and want to switch to effect.
The goal is NOT to promote the use of optics.

## The API

This library exposes a very small subset of the monocle-ts API. I basically rewrote parts I
use personally. If you need more, feel free to open an issue or a PR.

Along the way, I've made some changes to the API to make it more effect-friendly. Also, I've
included some changes to the API that I either wish were in the monocle-ts or have implemented
as a custom in-app code.

Notably,

- multi-parameter functions are implemented and exposed as duals, thus there are always
  both data-first and data-last variants,
- the index module exposes a fully named `Lens` and `Optional` modules, so the expected
  usage is e.g `Lens.prop` instead of `L.prop`,
- I included a `Lens.extract` / `Optional.extract` combinators, they are the moral equivalents
  of type-level `Extract<A, { [K in keyof A]: B }` and are useful when creating an
  optional from a discriminated union,
- I included `Lens.append` / `Lens.appendAll` / `Optional.append` / `Optional.appendAll`
  combinators that work on lenses / optionals focusing an array and they create a function
  performing an append / extend on the focused array,
- I modified the signature of `Lens.prop` / `Optional.prop` to accept multiple keys at once,
  so one can write `Lens.prop(lens, 'a', 'b', 'c')` instead of 
  `pipe(lens, Lens.prop('a'), Lens.prop('b'), Lens.prop('c'))`.
- I renamed `Lens.props` / `Optional.props` to `Lens.pick` / `Optional.pick` to unify the naming
  with `@effect/schema`, `effect/Struct`, etc.

Please refer to the [monocle-ts README](https://github.com/gcanti/monocle-ts) and
the [effect-monocle API docs](https://sukovanej.github.io/effect-monocle/) for more information.
