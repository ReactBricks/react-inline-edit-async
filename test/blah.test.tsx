import * as React from 'react'
import * as ReactDOM from 'react-dom'
import InlineEdit from '../src'

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<InlineEdit value="a" onChange={() => fetch('')} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})
