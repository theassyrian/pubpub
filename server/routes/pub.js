import React from 'react';
import uuidValidate from 'uuid-validate';
import { Pub } from 'containers';

import Html from '../Html';
import app from '../server';
import {
	hostIsValid,
	renderToNodeStream,
	getInitialData,
	handleErrors,
	generateMetaComponents,
} from '../utils';
import { getFirebaseToken } from '../utils/firebaseAdmin';
import { findPub, lookupPubVersion } from '../utils/pubQueries';

// TODO(ian): Move this somewhere else, or actually parse the document with a Prosemirror schema
// and use the corresponding utility from @pubpub/editor
const isEmptyPubDoc = (docJson) => docJson.content.length === 1 && !docJson.content[0].content;

const getMode = (path, params) => {
	const { slug, reviewShortId } = params;
	if (path.indexOf(`/pub/${slug}/draft`) > -1) {
		return 'draft-redirect';
	}
	if (path.indexOf(`/pub/${slug}/merge/`) > -1) {
		return 'merge';
	}
	if (path.indexOf(`/pub/${slug}/reviews/new`) > -1) {
		return 'reviewCreate';
	}
	if (path.indexOf(`/pub/${slug}/reviews/${reviewShortId}`) > -1) {
		return 'review';
	}
	if (path.indexOf(`/pub/${slug}/reviews`) > -1) {
		return 'reviews';
	}
	if (path.indexOf(`/pub/${slug}/manage`) > -1) {
		return 'manage';
	}
	if (path.indexOf(`/pub/${slug}/branch/new`) > -1) {
		return 'branchCreate';
	}
	return 'document';
};

app.get(
	[
		'/pub/:slug',
		'/pub/:slug/draft',
		'/pub/:slug/branch/new',
		'/pub/:slug/branch/:branchShortId',
		'/pub/:slug/branch/:branchShortId/:versionNumber',
		'/pub/:slug/merge/:fromBranchShortId/:toBranchShortId',
		'/pub/:slug/reviews/new/:fromBranchShortId/',
		'/pub/:slug/reviews/new/:fromBranchShortId/:toBranchShortId',
		'/pub/:slug/reviews',
		'/pub/:slug/reviews/:reviewShortId',
		'/pub/:slug/manage/',
		'/pub/:slug/manage/:manageMode',
	],
	async (req, res, next) => {
		if (!hostIsValid(req, 'community')) {
			return next();
		}
		try {
			if (req.query.version) {
				if (!uuidValidate(req.query.version)) {
					throw new Error('Pub Not Found');
				}
				const versionLookup = await lookupPubVersion(req.query.version);
				if (versionLookup) {
					const { historyKey, shortId } = versionLookup;
					return res.redirect(`/pub/${req.params.slug}/branch/${shortId}/${historyKey}`);
				}
			}

			const mode = getMode(req.path, req.params);
			const initialData = await getInitialData(req);
			const pubData = await findPub(req, initialData, mode);

			if (mode === 'draft-redirect') {
				return res.redirect(`/pub/${req.params.slug}`);
			}

			if (!pubData.canEditBranch && isEmptyPubDoc(pubData.initialDoc)) {
				throw new Error('Pub Not Found');
			}

			const firebaseToken = await getFirebaseToken(initialData.loginData.id || 'anon', {
				branchId: `branch-${pubData.activeBranch.id}`,
				canEditBranch: pubData.activeBranch.canEdit,
				canViewBranch: pubData.activeBranch.canView,
				canDiscussBranch: pubData.activeBranch.canDiscuss,
				canManage: pubData.canManage,
				userId: initialData.loginData.id,
			});

			const newInitialData = {
				...initialData,
				pubData: {
					...pubData,
					firebaseToken: firebaseToken,
					mode: mode,
				},
			};
			const primaryCollection = pubData.collectionPubs.reduce((prev, curr) => {
				if (curr.isPrimary && curr.collection.kind !== 'issue') {
					return curr;
				}
				return prev;
			}, {});
			const contextTitle = primaryCollection.title || initialData.communityData.title;
			/* We calculate titleWithContext in generateMetaComponents. Since we will use */
			/* titleWithContext in other locations (e.g. search), we should eventually */
			/* write a helper function that generates these parameters. */
			return renderToNodeStream(
				res,
				<Html
					chunkName="Pub"
					initialData={newInitialData}
					headerComponents={generateMetaComponents({
						initialData: initialData,
						title: pubData.title,
						contextTitle: contextTitle,
						description: pubData.description,
						image: pubData.avatar,
						attributions: pubData.attributions,
						publishedAt: pubData.firstPublishedAt,
						doi: pubData.doi,
						// unlisted: isUnlistedDraft,
					})}
				>
					<Pub {...newInitialData} />
				</Html>,
			);
		} catch (err) {
			return handleErrors(req, res, next)(err);
		}
	},
);