import React, { useCallback, useContext, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { _cs, listToMap, isDefined, union, isTruthyString } from '@togglecorp/fujs';

import Button from '#rsca/Button';

import useRequest from '#restrequest';

import {
    LEAD_STATUS,
    LEAD_TYPE,
} from '../utils';
import { LeadProcessorContext } from '../LeadProcessor';
import CandidateLeadsModal from './CandidateLeadsModal';

import styles from './styles.scss';

// Get key from lead data to look up extractions
function getSourceKey(data) {
    const { sourceType, url, attachment } = data;
    if (sourceType === LEAD_TYPE.website) {
        return data.url;
    }
    if ([LEAD_TYPE.dropbox, LEAD_TYPE.drive, LEAD_TYPE.file].includes(sourceType)) {
        return attachment?.s3 ? `s3::${attachment.s3}` : undefined;
    }
    return undefined;
}
// Get source info from lead data to query for extractions
function getSource(data) {
    const { sourceType, url, attachment } = data;
    if (sourceType === LEAD_TYPE.website) {
        return data.url ? { url: data.url } : undefined;
    }
    if ([LEAD_TYPE.dropbox, LEAD_TYPE.drive, LEAD_TYPE.file].includes(sourceType)) {
        return attachment?.s3 ? { s3: attachment.s3 } : undefined;
    }
    return undefined;
}

const propTypes = {
    className: PropTypes.string,
    onLeadsAdd: PropTypes.func.isRequired,
    onOrganizationsAdd: PropTypes.func.isRequired,
};

const defaultProps = {
    className: undefined,
};

function CandidateLeads(props) {
    const {
        className,
        onLeadsAdd,
        onOrganizationsAdd,
    } = props;

    const {
        candidateLeads,
        showProcessingModal,
        setProcessingModalVisibility,
        clearCompletedCandidateLeads,
    } = useContext(LeadProcessorContext);

    const handleProcessingModalShow = useCallback(() => {
        setProcessingModalVisibility(true);
    }, [setProcessingModalVisibility]);

    const handleProcessingModalClose = useCallback(() => {
        setProcessingModalVisibility(false);
    }, [setProcessingModalVisibility]);

    const [asyncJobUuid, setAsycJobUuid] = useState();
    const [extractions, setExtractions] = useState({});

    const uploading = useMemo(() => (
        candidateLeads.some(candidateLead => (
            candidateLead.leadState === LEAD_STATUS.pristine
            || candidateLead.leadState === LEAD_STATUS.uploading
        ))
    ), [candidateLeads]);

    const completedCandidateLeads = useMemo(
        () => candidateLeads.filter(
            candidateLead => candidateLead.leadState === LEAD_STATUS.complete,
        ),
        [candidateLeads],
    );

    const sources = useMemo(
        () => (
            completedCandidateLeads
                .filter((lead) => {
                    const sourceKey = getSourceKey(lead.data);
                    return !!sourceKey && !extractions[sourceKey];
                })
                .map(lead => getSource(lead.data))
                .filter(isDefined)
        ),
        [extractions, completedCandidateLeads],
    );

    const organizationsRaw = useMemo(
        () => {
            const extraMetaList = Object.values(extractions)
                .map(extraction => extraction.extraMeta)
                .filter(isDefined);

            const authors = new Set(
                extraMetaList.map(item => item.authorRaw).filter(isTruthyString),
            );
            const publishers = new Set(
                extraMetaList.map(item => item.sourceRaw).filter(isTruthyString),
            );
            const orgs = [...union(authors, publishers)];
            return orgs;
        },
        [extractions],
    );

    const mergeExtractions = useCallback(
        (ext) => {
            if (!ext) {
                return;
            }

            setExtractions(oldExtractions => ({
                ...oldExtractions,
                ...listToMap(
                    ext,
                    item => (item.url ? item.url : item.key),
                    item => item,
                ),
            }));
        },
        [],
    );

    const [organizationPending,,, organizationTrigger] = useRequest({
        url: 'server://organizations/search',
        method: 'POST',
        body: { organizations: organizationsRaw },
        // TODO: use real api
        mockResponse: {
            count: 1,
            next: null,
            previous: null,
            results: [
                {
                    key: 'Amnesty International',
                    organization: {
                        id: 3448,
                        createdAt: '2019-05-28T11:49:49.109566Z',
                        modifiedAt: '2019-05-28T11:49:49.481689Z',
                        regionsDisplay: [],
                        title: 'Amnesty International',
                        shortName: 'Amnesty',
                        longName: 'Amnesty International',
                        url: 'http://www.amnesty.org/',
                        verified: true,
                        regions: [],
                    },
                },
            ],
        },
        onSuccess: (response) => {
            const orgs = response.results;
            const organizationMapping = listToMap(
                orgs,
                item => item.key,
                item => item.organization.id,
            );
            const newLeads = completedCandidateLeads.map((lead) => {
                let { data } = lead;

                const sourceKey = getSourceKey(data);
                if (sourceKey && extractions[sourceKey]?.extraMeta) {
                    const {
                        // NOTE: country field is not present on leads
                        country, // eslint-disable-line no-unused-vars, @typescript-eslint/no-unused-vars, max-len

                        sourceRaw,
                        authorRaw,
                        ...other
                    } = extractions[sourceKey].extraMeta;
                    data = { ...data, ...other };

                    if (sourceRaw) {
                        const organization = organizationMapping[sourceRaw];
                        if (organization) {
                            data.source = organization;
                        } else {
                            data.sourceSuggestion = sourceRaw;
                        }
                    }
                    if (authorRaw) {
                        const organization = organizationMapping[authorRaw];
                        if (organization) {
                            data.author = organization;
                        } else {
                            data.authorSuggestion = authorRaw;
                        }
                    }
                }

                return {
                    faramValues: data,
                    serverId: lead.serverId,
                };
            });

            // NOTE: Adding organizations used on new leads
            onOrganizationsAdd(orgs);
            onLeadsAdd(newLeads);

            clearCompletedCandidateLeads();
            setProcessingModalVisibility(false);
        },
        onFailure: () => {
            console.error('failed');
        },
    });

    const [pollRequestPending,,, pollRequestTrigger] = useRequest({
        url: 'serverless://source-extract/',
        method: 'POST',
        body: { asyncJobUuid },
        shouldPoll: (response, run) => {
            if (response.status === 'pending' || response.status === 'started') {
                const wait = 1000 * Math.min(2 ** run, 64);
                return wait;
            }
            return -1;
        },
        onSuccess: (response) => {
            if (response.status === 'success') {
                mergeExtractions(response.sources);
                organizationTrigger();
            } else {
                console.error('failed');
            }
        },
        onFailure: () => {
            console.error('failed');
        },
    });

    const [initialRequestPending,,, initialRequestTrigger] = useRequest({
        url: 'serverless://source-extract/',
        method: 'POST',
        body: { sources },
        // NOTE: no need to request the server if there are no sources, just trigger
        mockResponse: sources.length <= 0 ? {} : undefined,
        onSuccess: (response) => {
            if (response.existingSources) {
                mergeExtractions(response.existingSources);
            }
            if (response.asyncJobUuid) {
                setAsycJobUuid(response.asyncJobUuid);
                pollRequestTrigger();
            } else {
                organizationTrigger();
            }
        },
        onFailure: () => {
            console.error('failed');
        },
    });

    const pending = initialRequestPending || pollRequestPending || organizationPending;

    // TODO: show pending/progress
    return (
        <>
            {candidateLeads.length > 0 && (
                <div className={_cs(className, styles.candidateLeads)}>
                    <div className={styles.header}>
                        <h3 className={styles.heading}>
                            {`Candidate Leads (${candidateLeads.length})`}
                        </h3>
                        <Button
                            className={styles.expandButton}
                            onClick={handleProcessingModalShow}
                            iconName="expand"
                            transparent
                        />
                    </div>
                </div>
            )}
            {showProcessingModal && (
                <CandidateLeadsModal
                    pending={pending}
                    actionDisabled={uploading}
                    onLoad={initialRequestTrigger}
                    onClose={handleProcessingModalClose}
                />
            )}
        </>
    );
}

CandidateLeads.propTypes = propTypes;
CandidateLeads.defaultProps = defaultProps;

export default CandidateLeads;
