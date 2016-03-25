/* global CodeMirror */

import React, {PropTypes} from 'react';
import Radium, {Style} from 'radium';
import {Button, LoaderIndeterminate, License, Menu} from 'components';
import {globalStyles} from 'utils/styleConstants';

import {globalMessages} from 'utils/globalMessages';
import {injectIntl, FormattedMessage} from 'react-intl';
import PPMComponent from 'markdown/PPMComponent';

let styles = {};

// import {loadCss} from 'utils/loadingFunctions';
import initCodeMirrorMode from 'containers/Editor/editorCodeMirrorMode';
import {codeMirrorStyles} from 'containers/Editor/codeMirrorStyles';
import {clearTempHighlights} from 'components/PubSelectionPopup/selectionFunctions';

// import marked from '../../modules/markdown/markdown';
// import markdownExtensions from '../../components/EditorPlugins';
// marked.setExtensions(markdownExtensions);

const PubDiscussionsInput = React.createClass({
	propTypes: {
		addDiscussionHandler: PropTypes.func,
		addDiscussionStatus: PropTypes.string,
		// newDiscussionData: PropTypes.object,
		userThumbnail: PropTypes.string,
		codeMirrorID: PropTypes.string,
		parentID: PropTypes.string,
		isReply: PropTypes.bool,
		isCollaborator: PropTypes.bool,
		isPublished: PropTypes.bool,
		parentIsPrivate: PropTypes.bool,
		activeSaveID: PropTypes.string,
		saveID: PropTypes.string,
		intl: PropTypes.object,
		toggleAssetLibrary: PropTypes.func,

	},

	getInitialState() {
		return {
			expanded: false,
			content: '',
			selections: {},
			showPreview: false,
			showPreviewText: false,
			isPrivateChecked: false,
		};
	},

	componentWillMount() {
			this.setState({isPrivateChecked: this.props.parentIsPrivate});
	},
	componentDidMount() {
		initCodeMirrorMode();

		const placeholderMsg = (this.props.isReply) ? globalMessages.discussionReplyPlaceholder : globalMessages.discussionPlaceholder;

		const cmOptions = {
			lineNumbers: false,
			value: '',
			lineWrapping: true,
			viewportMargin: Infinity, // This will cause bad performance on large documents. Rendering the entire thing...
			autofocus: false,
			mode: 'pubpubmarkdown',
			extraKeys: {'Ctrl-Space': 'autocomplete'},
			placeholder: this.props.intl.formatMessage(placeholderMsg),
		};

		const codeMirror = CodeMirror(document.getElementById(this.props.codeMirrorID), cmOptions);
		codeMirror.on('change', this.onEditorChange);
		this.cm = codeMirror;
	},

	componentWillReceiveProps(nextProps) {
		if (this.props.addDiscussionStatus === 'loading' && this.props.activeSaveID === this.props.saveID && nextProps.addDiscussionStatus === 'loaded') {
			// This means the discussion was succesfully submitted
			// Reset any form options here.
			// const cm = document.getElementsByClassName('CodeMirror')[0].CodeMirror;
			const cm = document.getElementById(this.props.codeMirrorID).childNodes[0].CodeMirror;
			cm.setValue('');
			clearTempHighlights();

		}
		// else if (this.props.newDiscussionData && this.props.newDiscussionData.get && nextProps.newDiscussionData && nextProps.newDiscussionData.get && this.props.newDiscussionData.get('selections').size !== nextProps.newDiscussionData.get('selections').size) {
		// 	// const cm = document.getElementsByClassName('CodeMirror')[0].CodeMirror;
		// 	const cm = document.getElementById(this.props.codeMirrorID).childNodes[0].CodeMirror;
		// 	const spacing = cm.getValue().length ? ' ' : '';
		// 	cm.setValue(cm.getValue() + spacing + '[[selection: index=' + nextProps.newDiscussionData.get('selections').size + ']] ' );
		// 	cm.setCursor(cm.lineCount(), 0);
		// 	// setTimeout(() => {cm.focus();}, 200);
		// 	cm.focus();
		// 	// cm.focus();
		// }
		//
		// const newSelections = nextProps.newDiscussionData && nextProps.newDiscussionData.get ? nextProps.newDiscussionData.get('selections').toArray() : [];
		// this.setState({selections: newSelections});

		// console.log('selections! ', nextProps.newDiscussionData.get('selections'));

	},

	onEditorChange: function(cm, change) {
		const content = cm.getValue();
		const showPreview = (this.state.showPreview || content.indexOf('[[selection:') !== -1);
		this.setState({content: content, showPreview: showPreview, expanded: this.state.expanded || showPreview, showPreviewText: true});
		// console.log('change!');
		// console.log(cm);
	},

	submitDiscussion: function() {
		const newDiscussion = {};
		// const cm = document.getElementsByClassName('CodeMirror')[0].CodeMirror;
		const cm = document.getElementById(this.props.codeMirrorID).childNodes[0].CodeMirror;
		newDiscussion.markdown = cm.getValue();
		// newDiscussion.assets = {};
		// newDiscussion.selections = {};
		// newDiscussion.references = {};
		newDiscussion.parent = this.props.parentID;
		newDiscussion.private = this.props.parentIsPrivate || this.refs.isPrivate.checked;
		this.props.addDiscussionHandler(newDiscussion, this.props.saveID);
	},

	onFocus: function() {
		this.setState({expanded: true});
	},
	onBlur: function() {
		if (this.cm.getValue().length === 0) {
			this.setState({expanded: false});
		}
	},

	toggleLivePreview: function() {
		this.setState({showPreview: !this.state.showPreview});
	},

	togglePrivate: function() {
		this.setState({isPrivateChecked: !this.state.isPrivateChecked});
	},

	render: function() {
		const menuItems = [
			{ key: 'preview', string: 'Preview', function: this.toggleLivePreview, isActive: this.state.showPreview },
			{ key: 'formatting', string: 'Formatting', function: ()=>{} },
			{ key: 'assets', string: 'Assets', function: this.props.toggleAssetLibrary, noSeparator: true },
		];

		return (
			<div style={[styles.container, this.props.isReply && styles.replyContainer]}>
				<Style rules={{
					...codeMirrorStyles(undefined, '.inputCodeMirror'),
					'.inputCodeMirror .CodeMirror': {
						backgroundColor: 'transparent',
						fontSize: '15px',
						color: '#222',
						fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
						padding: '0px 20px',
						width: 'calc(100% - 40px)',
						minHeight: '25px',
						fontWeight: '300'
					},
					'.inputCodeMirror .CodeMirror-placeholder': {
						color: '#aaa',
					},
				}} />

				<div style={[styles.inputTopLine, styles.expanded(this.state.expanded, true)]}>
					<div style={styles.thumbnail}>
						{this.props.userThumbnail
							? <img style={styles.thumbnailImage}src={this.props.userThumbnail} />
							: null
						}
					</div>
					<div style={styles.license} key={'discussionLicense'}>
						<License text={'All discussions are licensed under a'} hover={true} />
					</div>

					{/* <div style={styles.topCheckbox} key={'newDiscussionAnonymous'} >
						<label style={styles.checkboxLabel} htmlFor={'anonymousDiscussion'}>Anonymous</label>
						<input style={styles.checkboxInput} name={'anonymousDiscussion'} id={'anonymousDiscussion'} type="checkbox" value={'anonymous'} ref={'anonymousDiscussion'}/>
					</div>
					<div style={styles.topCheckbox} key={'newDiscussionPrivate'} >
						<label style={styles.checkboxLabel} htmlFor={'privateDiscussion'}>Private</label>
						<input style={styles.checkboxInput} name={'privateDiscussion'} id={'privateDiscussion'} type="checkbox" value={'private'} ref={'privateDiscussion'}/>
					</div> */}
				</div>

				<div style={styles.inputBox(this.state.expanded)}>
					<div style={styles.inputMenuWrapper}>
						<Menu items={menuItems} customClass={'discussionInputMenu'} height={'20px'} fontSize={'0.9em'} fontWeight={'400'}/>
					</div>


					<div id={this.props.codeMirrorID} className={'inputCodeMirror'} onBlur={this.onBlur} onFocus={this.onFocus}></div>

				</div>

				{this.state.showPreview
					? <div style={styles.livePreviewBox}>
						<PPMComponent markdown={this.state.content} />
					</div>
					: null
				}


				{/* <div style={styles.loaderContainer}>
					{(this.props.addDiscussionStatus === 'loading' && this.props.activeSaveID === this.props.saveID ? <LoaderIndeterminate color="#444"/> : null)}
				</div> */}

				<div style={[styles.inputBottomLine, styles.expanded(this.state.expanded || this.props.isReply, false)]}>

					<div style={[styles.topCheckbox, this.props.isCollaborator && styles.topCheckboxVisible, this.props.parentIsPrivate && styles.topCheckboxLocked ]} key={'newDiscussionPrivate'} >
						<label style={styles.checkboxLabel} htmlFor={'isPrivate-' + this.props.saveID} onBlur={this.onBlur} onFocus={this.onFocus}>Collaborators Only</label>
						<input style={styles.checkboxInput} name={'isPrivate-' + this.props.saveID} id={'isPrivate-' + this.props.saveID} type="checkbox" value={'private'} onChange={this.togglePrivate} checked={this.state.isPrivateChecked} ref={'isPrivate'} onBlur={this.onBlur} onFocus={this.onFocus}/>
					</div>
					<div style={globalStyles.clearFix}></div>
					<div style={styles.privacyMessage}>
						{!this.props.isPublished && !this.state.isPrivateChecked && !this.props.parentIsPrivate ? 'Your comment will be public when this pub is published!' : ''}
						{!this.props.isPublished && !this.state.isPrivateChecked && !this.props.parentIsPrivate && this.props.isCollaborator ? <div>If you wish to keep it private, check 'Collaborators Only'</div> : ''}
						{this.state.isPrivateChecked && !this.props.parentIsPrivate ? 'Your comment will be private forever, only visible to collaborators.' : ''}
						{this.props.parentIsPrivate  ? 'Your comment will be private forever, only visible to collaborators, because you are replying to a private comment.' : ''}
					</div>
					{/* {
						(this.state.showPreviewText) ?
					<span style={styles.livePreviewText}>Live Preview: <span style={styles.livePreviewToggle} onClick={this.toggleLivePreview}>{(this.state.showPreview) ? 'On' : 'Off'}</span> <span style={styles.lighterText}>(you can use <a target="_blank" href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet">markdown</a> for styling)</span></span>
					: null
					} */}
					<Button
						key={this.props.codeMirrorID + '-submitButton'}
						label={'Submit'}
						onClick={this.submitDiscussion}
						isLoading={this.props.addDiscussionStatus === 'loading' && this.props.activeSaveID === this.props.saveID}
						align={'right'} />
					{/*<div style={styles.submitButton} key={'newDiscussionSubmit'} onClick={this.submitDiscussion}>
						<FormattedMessage {...globalMessages.Submit}/>
					</div>*/}
				</div>

			</div>
		);
	}
});

export default injectIntl(Radium(PubDiscussionsInput));

styles = {
	expanded: function(expand, flipUp) {
		const expandObj = {};
		if (expand) {
			expandObj.opacity = 1;
			expandObj.transform = 'translateY(0px)';
		} else {
			expandObj.opacity = 0;
			expandObj.pointerEvents = 'none';
			if (flipUp) {
				expandObj.transform = 'translateY(10px)';
			} else {
				expandObj.transform = 'translateY(-10px)';
			}
		}
		expandObj.transition = 'transform .15s, opacity .15s';

		return expandObj;
	},
	container: {
		width: '100%',
		overflow: 'hidden',
		margin: '0px 0px',
		position: 'relative',
	},
	livePreviewText: {
		fontSize: '0.8em',
		fontWeight: '400',
		userSelect: 'none',
		cursor: 'default',
		marginLeft: '2.5%',
	},
	lighterText: {
		fontWeight: '300',
	},
	livePreviewToggle: {
		textDecoration: 'underline',
		cursor: 'pointer',
	},
	livePreviewBox: {
		width: 'calc(100% - 26px)',
		display: 'block',
		margin: '5px auto 15px',
		border: '1px dashed #888',
		padding: '10px',
		fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
		color: '#555',
		fontSize: '0.85em',
		backgroundColor: '#E8E8E8',
	},
	replyContainer: {
		// margin: '0px 10px 10px 0px',
	},
	inputTopLine: {
		// backgroundColor: 'rgba(255,0,0,0.1)',
		height: 22,
	},
	inputMenuWrapper: {
		borderBottom: '1px solid #ccc',
		marginBottom: '10px',
	},
	inputBottomLine: {
		// backgroundColor: 'rgba(255,0,100,0.1)',
		height: 20,
		marginBottom: '15px',
	},
	inputBox: function(expanded) {
		return {
			backgroundColor: '#fff',
			minHeight: 25,
			padding: '0px 0px 10px 0px',
			// boxShadow: '0 1px 3px 0 rgba(0,0,0,.2),0 1px 1px 0 rgba(0,0,0,.14),0 2px 1px -1px rgba(0,0,0,.12)',
			boxShadow: '0px 0px 2px rgba(0,0,0,0.4)',
			margin: '5px auto',
			width: 'calc(100% - 4px)',
			borderRadius: '1px',
			cursor: 'pointer',
			border: (expanded) ? '1px solid rgb(225, 225, 225)' : '1px solid white',
		};
	},
	loaderContainer: {
		position: 'absolute',
		bottom: '30px',
		width: '100%',
	},
	thumbnail: {
		width: '20px',
		height: '20px',
		padding: '1px',
		marginRight: '1px',
		float: 'right',
	},
	thumbnailImage: {
		width: '100%',
	},
	license: {
		float: 'right',
		lineHeight: '26px',
		opacity: '0.4',
		paddingRight: '4px',
		':hover': {
			opacity: '1.0',
		},
	},
	topCheckbox: {
		float: 'right',
		userSelect: 'none',
		color: globalStyles.sideText,
		pointerEvents: 'none',
		height: 0,
		overflow: 'hidden',
		marginBottom: 0,
		':hover': {
			cursor: 'pointer',
			color: globalStyles.sideHover,
		}
	},
	topCheckboxVisible: {
		pointerEvents: 'auto',
		height: '20px',
		marginBottom: '2px',
	},
	topCheckboxLocked: {
		opacity: 0.75,
		pointerEvents: 'none'
	},
	checkboxLabel: {
		fontSize: '15px',
		margin: '0px 3px 0px 15px',
		cursor: 'pointer',
	},
	checkboxInput: {
		cursor: 'pointer',
	},
	privacyMessage: {
		textAlign: 'right',
		fontSize: '0.9em',
		color: '#E40303',
		margin: '2px 0px',
	},
	submitButton: {
		float: 'right',
		color: globalStyles.sideText,
		padding: '0px 5px',
		':hover': {
			cursor: 'pointer',
			color: globalStyles.sideHover,
		}

	},

};
