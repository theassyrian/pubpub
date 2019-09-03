import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Button, Icon } from '@blueprintjs/core';

require('./pubBottomSection.scss');

const propTypes = {
	accentColor: PropTypes.string,
	centerItems: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
	children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
	className: PropTypes.string,
	defaultExpanded: PropTypes.bool,
	iconItems: PropTypes.func,
	isSearchable: PropTypes.bool,
	searchPlaceholder: PropTypes.string,
	onSearch: PropTypes.func,
	title: PropTypes.node.isRequired,
};

const defaultProps = {
	accentColor: 'black',
	centerItems: [],
	children: null,
	className: '',
	defaultExpanded: false,
	iconItems: () => null,
	isSearchable: false,
	onSearch: () => {},
	searchPlaceholder: 'Enter keywords to search for...',
};

export const AccentedIconButton = (props) => {
	const { accentColor, icon, title, ...buttonProps } = props;
	return (
		<Button
			minimal
			icon={<Icon title={title} color={accentColor} icon={icon} />}
			{...buttonProps}
		/>
	);
};

AccentedIconButton.propTypes = {
	accentColor: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
	title: PropTypes.string,
};

AccentedIconButton.defaultProps = {
	title: null,
};

export const SectionBullets = ({ children }) => {
	return (Array.isArray(children) ? children : [children]).map((item, i) => (
		// eslint-disable-next-line react/no-array-index-key
		<div key={i} className="center-content-item">
			{item}
		</div>
	));
};

const PubBottomSection = (props) => {
	const {
		accentColor,
		centerItems,
		children,
		className,
		defaultExpanded,
		iconItems,
		isSearchable,
		onSearch,
		searchPlaceholder,
		title,
	} = props;
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);
	const [searchTerm, setSearchTerm] = useState(null);
	const isSearching = searchTerm !== null;

	const searchingTextStyle = isSearching ? { color: 'white' } : {};

	const renderSearchBar = () => {
		return (
			<input
				type="text"
				className="search-bar"
				onChange={(evt) => {
					const value = evt.target.value.trim();
					onSearch(value);
					setSearchTerm(value);
				}}
				placeholder={searchPlaceholder}
			/>
		);
	};

	const renderCenterItems = () => {
		return typeof centerItems === 'function'
			? centerItems({ isExpanded: isExpanded })
			: centerItems;
	};

	const renderIconItems = () => {
		const iconColor = isSearching ? 'white' : accentColor;
		return typeof iconItems === 'function'
			? iconItems({ isExpanded: isExpanded, isSearching: isSearching, iconColor: iconColor })
			: iconItems;
	};

	const renderRightmostIcon = () => {
		if (isSearching) {
			return (
				<AccentedIconButton
					accentColor="white"
					icon="cross"
					title="Search this section"
					onClick={() => setSearchTerm(null)}
				/>
			);
		}
		return (
			<AccentedIconButton
				title={isExpanded ? 'Collapse this section' : 'Expand this section'}
				accentColor={accentColor}
				icon={isExpanded ? 'collapse-all' : 'expand-all'}
				onClick={() => setIsExpanded(!isExpanded)}
			/>
		);
	};

	return (
		<div
			className={classNames(
				'pub-bottom-section-component',
				className,
				isSearching && 'searching',
				isExpanded && 'expanded',
			)}
		>
			{/* We already have a fully interactive expand button -- this is a bonus */}
			{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
			<div
				role={!isExpanded && 'button'}
				onClick={!isExpanded && (() => setIsExpanded(true))}
				className="top-row"
				style={{
					...(isSearching && { background: accentColor }),
					...(!isExpanded && { cursor: 'pointer' }),
				}}
			>
				<div className="left-title" style={searchingTextStyle}>
					{title}
				</div>
				<div className="center-content">
					{isSearching ? renderSearchBar() : renderCenterItems()}
				</div>
				<div className="right-icons" style={searchingTextStyle}>
					{isExpanded && isSearchable && !isSearching && (
						<AccentedIconButton
							accentColor={accentColor}
							icon="search"
							onClick={() => setSearchTerm('')}
						/>
					)}
					{renderIconItems()}
					{renderRightmostIcon()}
				</div>
			</div>
			{isExpanded && (
				<div className="section-content">
					{typeof children === 'function'
						? children({ searchTerm: searchTerm, isSearching: isSearching })
						: children}
				</div>
			)}
		</div>
	);
};

PubBottomSection.propTypes = propTypes;
PubBottomSection.defaultProps = defaultProps;
export default PubBottomSection;
