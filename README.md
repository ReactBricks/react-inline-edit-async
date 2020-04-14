# RIEC: React Inline Edit Component

Modern React component for inline edit of text/select values, written in Typescript.

I wrote this package to replace the good [`riek`](https://github.com/kaivi/riek) package that served me well, but hasn't been updated since June 2017.

Internally, RIEC uses the great [XState](https://xstate.js.org/) library by David Khourshid ([@DavidKPiano](https://twitter.com/DavidKPiano)).

## Installation

```bash
$ npm i --save riec
# or
$ yarn add riec
```

## Getting Started

### Minimal example

Here you can see a minimal example.

RIEC is a controlled component.

```jsx
import React, { useState } from 'react'
import InlineEdit from 'riec'

const App = () => {
  const onChange = value => {
    // serverCall().then...
    setValue(value)
  }

  const [value, setValue] = useState('pizza')

  return (
    <div>
      <InlineEdit value={value} onChange={onChange} />
    </div>
  )
}
```

Of the over 20 props you can use, only 2 are mandatory:

- `value`: a `string` representing the initial value, updated by the onChange function
- `onChange`: a function of value, which is supposed to update value upon success

### Why a string value

The `value` should be always a string, because anyway you would receive back a string from a React input component, so I think it's better to do any casting before setting the value. If you send in a number, you will receive back a string.
For the `select` input type is really important that the provided `value` (and the key corresponding to the `valueKey` are strings to enable pre-selecting the correct option.)

## A more complex example

# API

RIEC exposes just one component (`InlineEditProps`) and the "enum" object `InputType`.

## InlineEdit and InputType

I think that it's useful to see the TypeScript interface of the InlineEdit component, even if you don't use TypeScript.

```ts
interface InlineEditProps {
  value: string
  onChange: (value: string) => void
  type?: InputType
  format?: (value: string) => string
  validate?: (value: string) => boolean
  isDisabled?: boolean
  allowEditWhileLoading?: boolean
  optimisticUpdate?: boolean
  saveTimeout?: number
  savedDuration?: number
  errorDuration?: number
  editProps?: {
    [key: string]: any
  }
  viewClass?: string
  editClass?: string
  disabledClass?: string
  loadingClass?: string
  invalidClass?: string
  savedClass?: string
  errorClass?: string
  showNewLines?: boolean
  options?: any[]
  valueKey?: string
  labelKey?: string
}
```

where `InputType` is an `enum` representing all the input types provided by RIEC.

```ts
enum InputType {
  Text = 'text',
  Number = 'number',
  Email = 'email',
  Password = 'password',
  Date = 'date',
  Range = 'range',
  TextArea = 'textarea',
  Select = 'select',
}
```

## Details of each prop

RIEC props may be split in 3 categories:

- **Main props** (such as the validation function)
- **CSS classes props** (such as the CSS class to apply while loading)
- **Input specific props** (such as the options for the `select` input type)

### Main props

- `value`:

  - A `string` representing the initial value, updated by the onChange function
  - Required
  - Defaults: none

- `onChange`:

  - a `function` accepting a string value: it is supposed to update the `value` upon success
  - Defaults: none

- `type`:

  - The input type to be displayed one of `text`, `number`, `email`, `password`, `date`, `range`, `textarea`, `select`.
  - You can reference the value by using the exported `InputType` enum (working for JavaScript, too)
  - Optional
  - Default: `text`

- `format`:

  - A function to format the value. It receives the `value` string and should return the formatted string (for example for dates or money)
  - Optional
  - Default: none

- `validate`:

  - A `function` to validate the value entered in the input field. It receives the `value` string and should return `true` if the value is valid, ore else `false`.
  - It is possible to apply a CSS class to the invalid input field (see `invalidClass`).
  - Invalid values are not sent to the `onChange` function.
  - Optional
  - Default: none (always valid)

- `isDisabled`:

  - `Boolean`. If `true`, the component will never switch to the "Edit" mode
  - Optional
  - Default: `false`

- `allowEditWhileLoading`:

  - `Boolean`. If `true`, the component allows editing while it is in the loading state (when `onChange` has been called but a new `value` hasn't been provided)
  - Optional
  - Default: `false`

- `optimisticUpdate`:

  - `Boolean`. If `true`, the component shows the new value immediately after calling `onChange`, even if it has not been set as a new `value` yet.
  - Optional
  - Default: `true`

- `saveTimeout`:

  - `Number` in milliseconds. When the component is in the "loading" state (after calling the `onChange` callback), if it doesn't receive a new value within this number of millisencods, it will abort the change and revert back to the old value, supposing `onChange` had some problems.
  - Optional
  - Default: 2000

- `savedDuration`:

  - `Number` in milliseconds. After receiving a new value, the component enters the "saved" state and remains there for this number of milliseconds.
  - During this period the `savedClass` CSS class is applied
  - Optional
  - Default: 700

- `errorDuration`:

  - `Number` in milliseconds. After the `saveTimeout` has passed, the component enters the "error" state and remains there for this number of millisencods.
  - During this period the `errorClass` CSS class is applied
  - Optional
  - Default: 1000

- `editProps`:
  - Props spread on the input tag if necessary (for example to pass `min`, `max`, `step` values to an input of type `number` or `range`)
  - Optional, no defaults

### CSS Classes props

- `viewClass`:

  - Class applied to the value `span` tag when in "view", "loading", "saved" or "error" states
  - Optional, no defaults

- `editClass`:

  - Class applied to the input tag when in "edit" state (valid or invalid value)
  - Optional, no defaults

- `disabledClass`:

  - Class applied to the value `span` tag when `isDisabled` is `true`
  - Optional, no defaults

- `loadingClass`:

  - Class applied to the value `span` tag when in "loading" state (`onChange` fired, no new `value` received, `saveTimeout` not expired)
  - Optional, no defaults

- `invalidClass`:

  - Class applied to the input tag in "edit" state when the input value is not valid (the `validate` function returns `false`)
  - Optional, no defaults

- `savedClass`:

  - Class applied to the input tag when in "saved" state (new `value` received, `savedDuration` not expired)
  - Optional, no defaults

- `errorClass`:
  - Class applied to the input tag when in "error" state (after `onChange` called, no new `value` received, `saveTimeout` expired and `errorDuration` not expired)
  - Optional, no defaults

### Component-specific props

#### For `textarea`:

- `showNewLines`:
  - `Boolean`. If `true`, `<br />` are added to the value, so that it mirrors the editing `textarea` content
  - Optional
  - Default: `true`

#### For `select`:

- `options`:
  - `Array` of objects to populate the select input `options`.
  - If `valueKey` and `labelKey` are not set, it should have a key with name `value` used for values and a key with name `label` used to show labels in the select input
  - `valueKey`: the name of the object key containing the values
  - `labelKey`: the name of the object key containing the labels
