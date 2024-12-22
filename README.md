# IRL.js
**In**cremental **R**eactive **L**ive programming environment for JavaScript.

Key principles:

  - **Liveness**

    The program you're working on should always be up and running, it should always be
    live and talking to you at any time. You should have instant feedback on your
    actions. This allows for much better programming experience and more productive
    development.

    Let `A = f(B, C, D)`. Then we can query the values of `A`, `B`, `C`, `D` at any time.
    We can also change `B`, `C` or `D` at any time.

  - **Incrementality**

    The effects on the system should add up incrementally, just like they do in the real
    world. No need to necessarily restart, recompile, reassemble from the ground up when
    you make a slight change. Everything is made with changeability and incrementality in
    mind.

    Let `A = f(B, C, D)`. Then we can compute `ΔA` by `ΔB`, `ΔC` and `ΔD`: `ΔA = δf(ΔB, ΔC, ΔD)`.
    In the worst case, of course `ΔA = f(B + ΔB, C + ΔC, D + ΔD) - f(B, C, D)` but in most
    cases there should be shorter ways to get `ΔA`.

  - **Reactivity**

    Some things can be defined in terms of the others. When these other things change, the
    first ones should also change accordingly.

    Let `A = f(B, C, D)`. Then we can change `B`, `C` or `D` at any time and instantly
    observe the change in `A`.
