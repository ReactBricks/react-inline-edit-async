import * as React from 'react'
import { useMachine } from '@xstate/react'
import getInlineEditMachine from './machine'
import Input from './Input'
import InputType from './inputType'

interface InlineEditProps {
  value: string
  onChange: (value: string) => Promise<any>
  type?: InputType
  validate?: (value: string) => boolean
  isDisabled?: boolean
  allowEditWhileLoading?: boolean
  optimisticUpdate?: boolean
  viewClass?: string
  editClass?: string
  disabledClass?: string
  loadingClass?: string
  invalidClass?: string
  editProps?: {
    [key: string]: any
  }
  format?: (value: string) => string
  showNewLines?: boolean
  options?: any[]
  valueKey?: string
  labelKey?: string
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onChange,
  type = InputType.Text,
  validate,
  isDisabled = false,
  allowEditWhileLoading = false,
  optimisticUpdate = true,
  viewClass,
  editProps,
  editClass,
  disabledClass,
  loadingClass,
  invalidClass,
  format,
  showNewLines = true,
  options = [],
  valueKey = 'value',
  labelKey = 'label',
}) => {
  //==========================
  // XState Machine
  // =========================
  const [current, send] = useMachine(
    getInlineEditMachine({
      value,
      isDisabled,
      allowEditWhileLoading,
      optimisticUpdate,
      validate,
      onChange,
    })
  )

  //==========================
  // Event Handlers
  // =========================

  const handleChange = (value: any) => {
    send({ type: 'CHANGE', value: value })
    if (type === InputType.Select) {
      send('ENTER')
    }
  }

  const handleBlur = () => {
    send('BLUR')
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 && type !== InputType.TextArea) {
      send('ENTER')
    } else if (event.keyCode === 27) {
      send('ESC')
    }
  }

  //==========================
  // CSS Classes View
  // =========================
  let viewClassNames = []
  if (viewClass) {
    viewClassNames.push(viewClass)
  }
  if (loadingClass && current.value === 'loading') {
    viewClassNames.push(loadingClass)
  }
  if (disabledClass && isDisabled) {
    viewClassNames.push(disabledClass)
  }
  const viewClassProp =
    viewClassNames.length > 0 ? { className: viewClassNames.join(' ') } : {}

  //==========================
  // CSS Classes Edit
  // =========================
  let editClassNames = []
  if (editClass) {
    editClassNames.push(editClass)
  }
  if (invalidClass && !current.context.isValid) {
    editClassNames.push(invalidClass)
  }
  const editClassProp =
    editClassNames.length > 0 ? { className: editClassNames.join(' ') } : {}

  //==========================
  // Format View Value
  // =========================
  let viewValue: any = current.context.value

  // If Select => get label
  if (type === InputType.Select) {
    const valueOption = options.find(
      (option: any) => option[valueKey] + '' === current.context.value
    )

    if (valueOption) {
      viewValue = valueOption[labelKey]
    }
  }

  // If format function, apply
  if (format) {
    viewValue = format(viewValue)
  }

  // If TextArea and showNewLine, do it
  if (type === InputType.TextArea && showNewLines) {
    viewValue = viewValue.split('\n').map((item: string, key: number) => {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      )
    })
  }

  //==========================
  // Render
  // =========================
  return (
    <div>
      {(current.value === 'view' || current.value === 'loading') && (
        <span
          {...viewClassProp}
          onClick={() => send('CLICK')}
          onFocus={() => send('FOCUS')}
          tabIndex={0}
        >
          {viewValue}
        </span>
      )}
      {current.value === 'edit' && (
        <Input
          type={type}
          value={current.context.newValue}
          editProps={editProps}
          editClassProp={editClassProp}
          options={options}
          valueKey={valueKey}
          labelKey={labelKey}
          handleChange={handleChange}
          handleKeyDown={handleKeyDown}
          handleBlur={handleBlur}
        />
      )}
    </div>
  )
}

export default InlineEdit
