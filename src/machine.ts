import { Machine, assign } from 'xstate'

interface InlineEditState {
  states: {
    view: {}
    edit: {}
    loading: {}
    saved: {}
    error: {}
  }
}

type InlineEditEvent =
  | { type: 'CLICK'; value: string }
  | { type: 'FOCUS'; value: string }
  | { type: 'CHANGE'; value: string }
  | { type: 'ESC'; value: string }
  | { type: 'ENTER'; value: string }
  | { type: 'BLUR'; value: string }
  | { type: 'SAVED'; value: string }

interface InlineEditContext {
  value: string
  newValue: string
  oldValue: string
  isValid: boolean
}

interface InlineEditMachineProps {
  value: string
  onChange: (value: string) => void
  isDisabled: boolean
  allowEditWhileLoading: boolean
  optimisticUpdate: boolean
  validate?: (value: string) => boolean
  saveTimeout: number
  savedDuration: number
  errorDuration: number
}

const getInlineEditMachine = ({
  value,
  isDisabled,
  allowEditWhileLoading,
  optimisticUpdate,
  validate,
  onChange,
  saveTimeout,
  savedDuration,
  errorDuration,
}: InlineEditMachineProps) =>
  Machine<InlineEditContext, InlineEditState, InlineEditEvent>(
    {
      id: 'inlineEdit',
      initial: 'view',
      context: {
        value,
        newValue: '',
        oldValue: '',
        isValid:
          validate && typeof validate === 'function' ? validate(value) : true,
      },
      states: {
        view: {
          entry: 'reset',
          on: {
            CLICK: { target: 'edit', cond: 'isEnabled' },
            FOCUS: { target: 'edit', cond: 'isEnabled' },
            SAVED: { target: 'saved', actions: 'commitChange' },
          },
        },
        edit: {
          entry: 'validate',
          on: {
            CHANGE: { target: 'edit', actions: 'change' },
            ESC: 'view',
            ENTER: [
              { target: 'loading', cond: 'shouldSend' },
              { target: 'view' },
            ],
            BLUR: [
              { target: 'loading', cond: 'shouldSend' },
              { target: 'view' },
            ],
          },
        },
        loading: {
          entry: [
            optimisticUpdate ? 'optimisticUpdate' : 'noAction',
            'sendChange',
          ],
          on: {
            CLICK: { target: 'edit', cond: 'canEditWhileLoading' },
            FOCUS: { target: 'edit', cond: 'canEditWhileLoading' },
            SAVED: { target: 'saved', actions: 'commitChange' },
          },
          after: {
            SAVE_TIMEOUT: {
              target: 'error',
              actions: optimisticUpdate ? 'cancelChange' : 'noAction',
            },
          },
        },
        saved: {
          on: {
            CLICK: { target: 'edit', cond: 'isEnabled' },
            FOCUS: { target: 'edit', cond: 'isEnabled' },
            SAVED: { target: 'saved', actions: 'commitChange' },
          },
          after: {
            SAVED_DURATION: { target: 'view' },
          },
        },
        error: {
          on: {
            CLICK: { target: 'edit', cond: 'isEnabled' },
            FOCUS: { target: 'edit', cond: 'isEnabled' },
            SAVED: { target: 'saved', actions: 'commitChange' },
          },
          after: {
            ERROR_DURATION: { target: 'view' },
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
        optimisticUpdate: assign({
          oldValue: context => context.value,
          value: context => context.newValue,
        }),
        noAction: () => {},
        sendChange: (context: InlineEditContext) => {
          onChange(context.newValue)
        },
        commitChange: assign({
          value: (_, event) => event.value,
        }),
        cancelChange: assign({
          value: context => context.oldValue,
        }),
        validate:
          validate && typeof validate === 'function'
            ? assign({
                isValid: context => validate(context.newValue),
              })
            : () => {},
      },
      guards: {
        shouldSend: context =>
          context.isValid && context.newValue !== context.value,
        isEnabled: () => !isDisabled,
        canEditWhileLoading: () => !isDisabled && allowEditWhileLoading,
      },
      delays: {
        SAVE_TIMEOUT: saveTimeout,
        SAVED_DURATION: savedDuration,
        ERROR_DURATION: errorDuration,
      },
    }
  )

export default getInlineEditMachine
