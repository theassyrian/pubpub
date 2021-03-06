import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Menu, MenuItem, Popover, Position, Spinner } from '@blueprintjs/core';

import { createReadingParamUrl, useCollectionPubs } from 'utils/collections';
import { pubDataProps } from 'types/pub';
import { pubUrl } from 'shared/utils/canonicalUrls';
import { getSchemaForKind } from 'shared/collections/schemas';
import { PageContext } from 'components/PageWrapper/PageWrapper';

require('./collectionBrowser.scss');

const propTypes = {
	className: PropTypes.string,
	collection: PropTypes.shape({
		id: PropTypes.string,
		kind: PropTypes.string,
		title: PropTypes.string,
	}).isRequired,
	currentPub: pubDataProps.isRequired,
	updateLocalData: PropTypes.func.isRequired,
};

const defaultProps = {
	className: '',
};

const CollectionBrowser = (props) => {
	const { className, collection, currentPub, updateLocalData } = props;
	const { communityData } = useContext(PageContext);
	const { pubs, isLoading } = useCollectionPubs(updateLocalData, collection);
	const { bpDisplayIcon } = getSchemaForKind(collection.kind);
	const readingPubUrl = (pub) => createReadingParamUrl(pubUrl(communityData, pub), collection);
	return (
		<div className="collection-browser-component">
			<ButtonGroup className={className}>
				<Popover
					minimal
					position={Position.BOTTOM_LEFT}
					content={
						<Menu className="collection-browser-component_menu">
							{isLoading && (
								<MenuItem
									disabled
									className="loading-menu-item"
									textClassName="menu-item-text"
									icon={<Spinner size={30} />}
									text="Loading..."
								/>
							)}
							{pubs &&
								!isLoading &&
								pubs.map((pub) => (
									<MenuItem
										active={currentPub.id === pub.id}
										href={readingPubUrl(pub)}
										textClassName="menu-item-text"
										// icon={
										// 	<PubPreviewImage
										// 		className="pub-preview"
										// 		pubData={pub}
										// 		fitIn={100}
										// 	/>
										// }
										icon="dot"
										key={pub.id}
										text={pub.title}
										multiline={true}
									/>
								))}
						</Menu>
					}
				>
					<Button icon={bpDisplayIcon} rightIcon="caret-down">
						{collection.title}
					</Button>
				</Popover>
			</ButtonGroup>
		</div>
	);
};

CollectionBrowser.propTypes = propTypes;
CollectionBrowser.defaultProps = defaultProps;
export default CollectionBrowser;
