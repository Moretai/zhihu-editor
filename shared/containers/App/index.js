import React, { Component } from 'react'
import { IntlProvider } from 'react-intl'
import cookie from 'react-cookie'
import { browserHistory } from 'react-router'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Editor, EditorState, RichUtils } from 'draft-js'
import style from './style.css'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = { editorState: EditorState.createEmpty() }
    this.onChange = (editorState) => this.setState({ editorState })
    this.handleKeyCommand = this.handleKeyCommand.bind(this)
  }

  handleKeyCommand(command, editorState) {
    console.warn(`==command===${command}`)
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  _onBoldClick() {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
  }

  render () {
    return (
      <IntlProvider locale="en">
        <div className={style.wrap}>
          {/* <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            handleKeyCommand={this.handleKeyCommand}
          />
          <button onClick={this._onBoldClick.bind(this)}>BOLD</button> */}
          App Hellow WORLD
          {this.props.children}
        </div>
      </IntlProvider>
    )
  }
}
