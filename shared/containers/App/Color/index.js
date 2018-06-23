import React from 'react'
import { Editor, EditorState, Modifier, RichUtils } from 'draft-js'
import style from './style.css'

const colorStyleMap = {
  red: {
    color: 'rgba(255, 0, 0, 1.0)',
  },
  orange: {
    color: 'rgba(255, 127, 0, 1.0)',
  },
  yellow: {
    color: 'rgba(180, 180, 0, 1.0)',
  },
  green: {
    color: 'rgba(0, 180, 0, 1.0)',
  },
  blue: {
    color: 'rgba(0, 0, 255, 1.0)',
  },
  indigo: {
    color: 'rgba(75, 0, 130, 1.0)',
  },
  violet: {
    color: 'rgba(127, 0, 255, 1.0)',
  },
};

const styles = {
  root: {
    fontFamily: '\'Georgia\', serif',
    fontSize: 14,
    padding: 20,
    width: 600,
  },
  editor: {
    borderTop: '1px solid #ddd',
    cursor: 'text',
    fontSize: 16,
    marginTop: 20,
    minHeight: 400,
    paddingTop: 20,
  },
  controls: {
    fontFamily: '\'Helvetica\', sans-serif',
    fontSize: 14,
    marginBottom: 10,
    userSelect: 'none',
  },
  styleButton: {
    color: '#999',
    cursor: 'pointer',
    marginRight: 16,
    padding: '2px 0',
  },
};

var COLORS = [
  {label: 'Red', style: 'red'},
  {label: 'Orange', style: 'orange'},
  {label: 'Yellow', style: 'yellow'},
  {label: 'Green', style: 'green'},
  {label: 'Blue', style: 'blue'},
  {label: 'Indigo', style: 'indigo'},
  {label: 'Violet', style: 'violet'},
];


export default class Color extends React.Component {
  constructor(props) {
    super(props)
    this.state = { editorState: EditorState.createEmpty()}

    this.focus = () => this.editor.focus()
    this.onChange = editorState => this.setState({ editorState })
    this.toggleColor = toggledColor => this._toggleColor(toggledColor)
  }

  _toggleColor(toggledColor) {
    const { editorState } = this.state
    // API:getSelection -> Returns the current cursor/selection state of the editor.
    const selection = editorState.getSelection()

    /*
     * API: Modifier.removeInlineStyle
     * removeInlineStyle(
        contentState: ContentState,
        selectionState: SelectionState,
        inlineStyle: string
      ): ContentState
     * Remove the specified inline style from the entire selected range.
     * 
     * API: EditorState.
     * getCurrentContent(): ContentState
     * Returns the current contents of the editor.
     */
    const nextContentState = Object.keys(colorStyleMap)
    .reduce((contentState, color) => {
      return Modifier.removeInlineStyle(contentState, selection, color)
    }, editorState.getCurrentContent())

    /*
     * API: EditorState.push
     * static push(
        editorState: EditorState,
        contentState: ContentState,
        changeType: EditorChangeType
      ): EditorState
     * Returns a new EditorState object with the specified ContentState applied as the new currentContent.
     * Based on the changeType, this ContentState may be regarded as a boundary state for undo/redo behavior.
     */
    let nextEditorState = EditorState.push(
      editorState,
      nextContentState,
      'change-inline-style'
    )

    /*
     * API: editorState.getCurrentInlineStyle()
     * getCurrentInlineStyle(): DraftInlineStyle
     * Returns an OrderedSet<string> that represents the "current" inline style for the editor.
     */
    const currentStyle = editorState.getCurrentInlineStyle()

    /*
     * API: selection.isCollapsed()
     * isCollapsed(): boolean
     * Returns whether the selection range is collapsed, i.e. a caret. This is true when the anchor and focus keys are the same /and/ the anchor and focus offsets are the same.
     *
     * API: RichUtils.toggleInlineStyle
     * toggleInlineStyle(
        editorState: EditorState,
        inlineStyle: string
      ): EditorState
     * Toggle the specified inline style for the selection. If the user's selection is collapsed, apply or remove the style for the internal state.
     * If it is not collapsed, apply the change directly to the document state.
     */
    // Unset style override for current color.
    if (selection.isCollapsed()) {
      nextEditorState = currentStyle.reduce((state, color) => {
        return RichUtils.toggleInlineStyle(state, color)
      }, nextEditorState)
    }

    // If the color is being toggled on, apply it.
    if (!currentStyle.has(toggledColor)) {
      nextEditorState = RichUtils.toggleInlineStyle(
        nextEditorState,
        toggledColor
      )
    }

    this.onChange(nextEditorState)
  }
  render() {
    const { editorState } = this.state
    return (
      <div className={style.root}>
          <ColorControls
            editorState={editorState}
            onToggle={this.toggleColor}
          />
          <div style={styles.editor} onClick={this.focus}>
            <Editor
              customStyleMap={colorStyleMap}
              editorState={editorState}
              onChange={this.onChange}
              placeholder="write down something..."
              ref={(ref) => this.editor = ref}
            />
          </div>
      </div>
    )
  }
}

class StyleButton extends React.Component {
  constructor(props) {
    super(props)
    this.onToggle = (e) => {
      e.preventDefault()
      this.props.onToggle(this.props.style)
    }
  }

  render() {
    let style
    if (this.props.active) {
      style = { ...styles.styleButton, ...colorStyleMap[this.props.style] }
    } else {
      style = styles.styleButton
    }

    return (
      <span style={style} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    )
  }
}

const ColorControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle()

  return (
    <div style={style.controls}>
      {COLORS.map(type =>
        <StyleButton
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  )
}
