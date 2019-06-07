import { Merge, Review } from '../models';
import { mergeFirebaseBranch } from '../utils/firebaseAdmin';
import { createMergedReviewEvent } from '../reviewEvent/queries';

export const createMerge = (inputValues, userData) => {
	return mergeFirebaseBranch(
		inputValues.pubId,
		inputValues.sourceBranchId,
		inputValues.destinationBranchId,
	)
		.then(() => {
			return Merge.create({
				noteContent: inputValues.noteContent,
				noteText: inputValues.noteText,
				userId: userData.id,
				pubId: inputValues.pubId,
				sourceBranchId: inputValues.sourceBranchId,
				destinationBranchId: inputValues.destinationBranchId,
			});
		})
		.then((newMergeData) => {
			const updateReview = Review.update(
				{ mergeId: newMergeData.id },
				{
					where: { id: inputValues.reviewId || null },
				},
			);
			const createMergeEvent = inputValues.reviewId
				? createMergedReviewEvent(userData, inputValues.pubId, inputValues.reviewId)
				: undefined;
			return Promise.all([newMergeData, createMergeEvent, updateReview]);
		})
		.then(([newMergeData, newReviewEvent]) => {
			return { newMerge: newMergeData, newReviewEvents: [newReviewEvent] };
		});
};

export const updateMerge = (inputValues, updatePermissions) => {
	// Filter to only allow certain fields to be updated
	const filteredValues = {};
	Object.keys(inputValues).forEach((key) => {
		if (updatePermissions.includes(key)) {
			filteredValues[key] = inputValues[key];
		}
	});

	return Merge.update(filteredValues, {
		where: { id: inputValues.mergeId },
	}).then(() => {
		return filteredValues;
	});
};

export const destroyMerge = (inputValues) => {
	return Merge.destroy({
		where: { id: inputValues.mergeId },
	});
};
