# React StatePack backstory

With several options available, state management in React apps still feels more cumbersome than it could be. With the React's local state mental model in mind, we might expect that a shared state management lib

(1) has a simple API introducing a minimal set of entities,<br>
(2) requires minimal changes to move local state to shared state,<br>
(3) straightforwardly supports SSR without workaround APIs.

The popular approaches to state management seem to depart from at least one of these points:

Apparently focusing on other aspects, **Redux Toolkit** and **MobX** don't fulfill any of the points listed above by bringing in their own mental models of shared state management with an inventory of new concepts and approaches.

**Zustand** does have a simple and minimalist API (point (1) fulfilled), but it's not quite similar to the React's state API, which leads to significant code rewrites while migrating from local state to shared state (so simplicity alone is not sufficient, point (2) unfulfilled). The Zustand's SSR setup requires that the default React store setup be transitioned to vanilla stores<sup>[[1](https://github.com/pmndrs/zustand/tree/main#react-context)]</sup>, which adds another state management pattern to the code and yet another sizable migration rewrite (point (3) unmet). Also, subjectively, Zustand introduces patterns that look unidiomatic in React, like calling methods on Zustand's store hooks (`useXStore.subscribe()`)<sup>[[2](https://github.com/pmndrs/zustand/tree/main#transient-updates-for-often-occurring-state-changes)]</sup>.

With a useState-like API, **Jotai** is the closest match (points (1) and (2) fulfilled). Still, Jotai requires a workaround API, a special hook, to set up SSR<sup>[[3](https://jotai.org/docs/utilities/ssr)]</sup> (point (3) unmet). Also, subjectively, the Jotai's core `atom()` function with its elaborate capabilities is an overkill for state management that looks hard to tree-shake.

The `useExternalState()` hook of `react-statepack` is an attempt to come up with a mostly self-explanatory lightweight useState-like approach to shared state management by focusing on the three points listed above. The lib's other hooks are built around the common practical use cases for `useExternalState()`. Whatever unused is tree-shakable.
