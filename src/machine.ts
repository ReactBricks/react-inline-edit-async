import { Machine, assign } from 'xstate'

interface InlineEditState {
  states: {
    view: {}
    edit: {}
    loading: {}
  }
}

type InlineEditEvent =
  | { type: 'CLICK'; value: string }
  | { type: 'FOCUS'; value: string }
  | { type: 'CHANGE'; value: string }
  | { type: 'ESC'; value: string }
  | { type: 'ENTER'; value: string }
  | { type: 'BLUR'; value: string }

interface InlineEditContext {
  value: string
  newValue: string
  isDisabled: boolean
  allowEditWhileLoading: boolean
  isValid: boolean
}

interface InlineEditMachineProps {
  value: string
  isDisabled: boolean
  allowEditWhileLoading: boolean
  validate?: (value: string) => boolean
  onChange: (value: string) => Promise<any>
}

const getInlineEditMachine = ({
  value,
  isDisabled,
  allowEditWhileLoading,
  validate,
  onChange,
}: InlineEditMachineProps) =>
  Machine<InlineEditContext, InlineEditState, InlineEditEvent>(
    {
      id: 'inlineEdit',
      initial: 'view',
      context: {
        value,
        newValue: '',
        isDisabled,
        allowEditWhileLoading,
        isValid:
          validate && typeof validate === 'function' ? validate(value) : true,
      },
      states: {
        view: {
          entry: 'reset',
          on: {
            CLICK: { target: 'edit', cond: 'isEnabled' },
            FOCUS: { target: 'edit', cond: 'isEnabled' },
          },
        },
        edit: {
          entry: 'validate',
          on: {
            CHANGE: { target: 'edit', actions: 'change' },
            ESC: 'view',
            ENTER: [
              { target: 'loading', cond: 'shouldCommit' },
              { target: 'view' },
            ],
            BLUR: [
              { target: 'loading', cond: 'shouldCommit' },
              { target: 'view' },
            ],
          },
        },
        loading: {
          invoke: {
            id: 'commitChange',
            src: 'commitChange',
            onDone: { target: 'view', actions: 'commit' },
            onError: { target: 'view' },
          },
          on: {
            CLICK: { target: 'edit', cond: 'canEditWhileLoading' },
            FOCUS: { target: 'edit', cond: 'canEditWhileLoading' },
          },
        },
      },
    },
    {
      actions: {
        change: assign({
          newValue: (_, event) => event.value,
        }),
        reset: assign({
          newValue: context => context.value,
        }),
        commit: assign({
          value: context => context.newValue,
        }),
        validate:
          validate && typeof validate === 'function'
            ? assign({
                isValid: context => validate(context.newValue),
              })
            : () => {},
      },
      guards: {
        shouldCommit: context =>
          context.isValid && context.newValue !== context.value,
        isEnabled: context => !context.isDisabled,
        canEditWhileLoading: context =>
          !context.isDisabled && context.allowEditWhileLoading,
      },
      services: {
        commitChange: context => {
          return onChange(context.newValue)
        },
      },
    }
  )

export default getInlineEditMachine
