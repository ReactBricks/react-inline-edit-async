import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import InlineEdit, { InputType } from '../.'

const App = () => {
  const validate = input => input.length > 3
  const onChange = value => {
    return fetch(value).then(_ => value)
  }

  const options = [
    { id: 1, name: 'Mela' },
    { id: 2, name: 'Arancia' },
    { id: 3, name: 'Albicocca' },
  ]

  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.styled { display: block; padding: 5px 10px; border-radius: 3px; }
.styled:hover { background-color: #f0f0f0 }
    `,
        }}
      />

      <InlineEdit
        value="pizza"
        validate={validate}
        onChange={onChange}
        viewClass="styled"
        allowEditWhileLoading
        optimisticUpdate={false}
      />
      <InlineEdit
        value="disabled"
        validate={validate}
        onChange={onChange}
        editProps={{ style: { padding: 10 } }}
        isDisabled
      />
      <InlineEdit
        value="koala"
        validate={validate}
        onChange={onChange}
        editProps={{ style: { padding: 10 } }}
      />
      <InlineEdit
        type={InputType.Number}
        value="34"
        validate={i => parseInt(i, 10) > 0}
        onChange={onChange}
        editProps={{ min: 10, max: 20, step: 2 }}
        format={value => '€ ' + value}
      />
      <InlineEdit
        type={InputType.Date}
        value="2020-03-12"
        onChange={onChange}
      />
      <InlineEdit
        type={InputType.Range}
        value="6"
        validate={i => parseInt(i, 10) > 3}
        onChange={onChange}
        editProps={{ min: 0, max: 10, step: 1 }}
      />
      <InlineEdit
        type={InputType.TextArea}
        value="pizza patatine"
        onChange={onChange}
        editProps={{ rows: 4 }}
        format={v => v.toUpperCase()}
      />
      <InlineEdit
        type={InputType.Select}
        value="2"
        onChange={onChange}
        options={options}
        valueKey="id"
        labelKey="name"
      />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
