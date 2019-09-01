import React from 'react';
import PropTypes from 'prop-types';

require('./pubNoteContent.scss');

const propTypes = {
	structured: PropTypes.string,
	unstructured: PropTypes.string,
};

const defaultProps = {
	structured: '',
	unstructured: '',
};

const PubNoteContent = (props) => {
	const { structured, unstructured } = props;
	return (
		<span className="pub-note-content-component">
			<span dangerouslySetInnerHTML={{ __html: structured }} />
			<span dangerouslySetInnerHTML={{ __html: unstructured }} />
		</span>
	);
};
PubNoteContent.propTypes = propTypes;
PubNoteContent.defaultProps = defaultProps;
export default PubNoteContent;