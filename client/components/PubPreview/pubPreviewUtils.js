import React from 'react';

export const generateAuthorString = (pubData) => {
	const authors = pubData.attributions.filter((attribution) => {
		return attribution.isAuthor;
	});
	return authors
		.sort((foo, bar) => {
			if (foo.order < bar.order) {
				return -1;
			}
			if (foo.order > bar.order) {
				return 1;
			}
			if (foo.createdAt < bar.createdAt) {
				return 1;
			}
			if (foo.createdAt > bar.createdAt) {
				return -1;
			}
			return 0;
		})
		.map((author, index) => {
			const separator = index === authors.length - 1 || authors.length === 2 ? '' : ', ';
			const prefix = index === authors.length - 1 && index !== 0 ? ' and ' : '';
			const user = author.user;
			return (
				<span key={`author-${user.id}`}>
					{prefix}
					{user.fullName}
					{separator}
				</span>
			);
		});
};
