# React Focus Container
Use jQuery-style focusIn/focusOut event handlers to be invoked whenever focus moves from
inside/outside a React component and the rest of the DOM.

## Motivation
Synchronizing the builtin focus events becomes tedious when a React component contains
multiple elements capable of acquiring focus; we often want to distinguish between focus
events moving between elements within a component (e.g., amoung items in a list) and focus
moving outside of a component (e.g., in which case we may want to collapse a dropdown).

This React component provides a container standardizing this behaviour: focusIn/focusOut
event callbacks are only triggered when focus moves inside/outside this component.

## Install

With [npm](http://npmjs.org) do:

```sh
npm install react-focus-container
```

## Usage
Pass ReactFocusContainer a React Element as children along with `onFocusIn` and `onFocusOut`
event handlers to be invoked when focus moves inside/outside of the element.
