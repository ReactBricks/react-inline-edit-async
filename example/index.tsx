import 'react-app-polyfill/ie11'
import * as React from 'react'
import { useState } from 'react'
import * as ReactDOM from 'react-dom'
import InlineEdit, { InputType } from '../.'

const App = () => {
  const validate = (input: string) => input.length > 3
  const onChange = (value: string) => {
    setTimeout(() => {
      setValue(value)
    }, 500)
  }

  const options = [
    { id: 1, name: 'Mela' },
    { id: 2, name: 'Arancia' },
    { id: 3, name: 'Albicocca' },
  ]

  const [value, setValue] = useState('pizza')

  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
.styled { display: block; padding: 5px 10px; border-radius: 3px; }
.styled:hover { background-color: #f0f0f0; }
.disabled { color: #ccc; }
.invalid { border: 1px solid #ff0000; }
.loading { color: #fc0; }
.saved { color: #4caf50; }
.error { color: #c00; }
`,
        }}
      />

      <div>
        <InlineEdit
          value={value}
          validate={validate}
          onChange={onChange}
          viewClass="styled"
          allowEditWhileLoading
          optimisticUpdate={true}
        />
      </div>

      <div>
        <InlineEdit
          value="disabled"
          validate={validate}
          onChange={onChange}
          isDisabled
        />
      </div>

      <div>
        <InlineEdit
          value={value}
          validate={validate}
          onChange={onChange}
          invalidClass="invalid"
          loadingClass="loading"
          savedClass="saved"
          errorClass="error"
          errorDuration={1200}
          savedDuration={1200}
          render={v => <code>{v}<sup>2</sup></code>}
        />
      </div>

      <div>
        <InlineEdit
          type={InputType.Number}
          value="34"
          validate={i => parseInt(i, 10) > 0}
          onChange={onChange}
          editProps={{ min: 10, max: 20, step: 2 }}
          format={value => '€ ' + value}
          loadingClass="loading"
          saveTimeout={1200}
        />
      </div>

      <div>
        <InlineEdit
          type={InputType.Date}
          value="2020-03-12"
          onChange={onChange}
        />
      </div>

      <div>
        <InlineEdit
          type={InputType.Range}
          value="6"
          validate={i => parseInt(i, 10) > 3}
          onChange={onChange}
          editProps={{ min: 0, max: 10, step: 1 }}
        />
      </div>

      <div>
        <InlineEdit
          type={InputType.TextArea}
          value="pizza patatine"
          onChange={onChange}
          editProps={{ rows: 4 }}
          format={v => v.toUpperCase()}
        />
      </div>

      <div>
        <InlineEdit
          type={InputType.Select}
          value="2"
          onChange={onChange}
          options={options}
          valueKey="id"
          labelKey="name"
        />
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
