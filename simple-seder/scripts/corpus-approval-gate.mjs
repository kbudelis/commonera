export function corpusApprovalGateErrors({ approval, manifest, expectedSourceCount }) {
  if (!approval?.comprehensiveApproval) return [];
  const errors = [];
  if (
    approval.requireAllSources &&
    manifest.approvedRuntimePack.sourceCount !== expectedSourceCount
  ) {
    errors.push(
      `approved runtime source coverage is ${manifest.approvedRuntimePack.sourceCount}/${expectedSourceCount}`,
    );
  }
  if (manifest.approvedRuntimePack.moduleCount < approval.minimumApprovedModules) {
    errors.push(
      `approved module count ${manifest.approvedRuntimePack.moduleCount} is below ${approval.minimumApprovedModules}`,
    );
  }
  if (
    manifest.approvedRuntimePack.exactCharacterCount <
    approval.minimumApprovedExactCharacters
  ) {
    errors.push(
      `approved exact-text characters ${manifest.approvedRuntimePack.exactCharacterCount} are below ${approval.minimumApprovedExactCharacters}`,
    );
  }
  if (
    manifest.researchCorpus.pendingContextReviewCount >
    approval.maximumPendingContextReviewSegments
  ) {
    errors.push(
      `pending context-review segments ${manifest.researchCorpus.pendingContextReviewCount} exceed ${approval.maximumPendingContextReviewSegments}`,
    );
  }
  if (
    !approval.reviewedAt ||
    !Array.isArray(approval.reviewedBy) ||
    approval.reviewedBy.length === 0
  ) {
    errors.push("reviewedAt and at least one reviewedBy entry are required");
  }
  if (
    approval.requiredRuntimeLoadingMode &&
    manifest.approvedRuntimePack.activeRuntimeLoadingMode !==
      approval.requiredRuntimeLoadingMode
  ) {
    errors.push(
      `active runtime loading mode ${manifest.approvedRuntimePack.activeRuntimeLoadingMode} does not satisfy ${approval.requiredRuntimeLoadingMode}`,
    );
  }
  return errors;
}

export function assertComprehensiveCorpusApproval(input) {
  const errors = corpusApprovalGateErrors(input);
  if (errors.length > 0) {
    throw new Error(
      `Refusing comprehensive runtime compilation:\n- ${errors.join("\n- ")}`,
    );
  }
}
