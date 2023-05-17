import React, { useEffect, useMemo } from 'react';
import { isDefined } from '@togglecorp/fujs';
import { gql, useQuery } from '@apollo/client';
import {
    Kraken,
    Message,
    PendingMessage,
} from '@the-deep/deep-ui';
import {
    NlpMapQuery,
    NlpMapQueryVariables,
} from '#generated/types';

import HeatMap from '#components/HeatMap';

import styles from './styles.css';

const NLP_MAP = gql`
query NlpMap($projectId: ID!, $nlpMapId: ID!) {
    project(id: $projectId) {
        id
        analysisGeoTask(id: $nlpMapId) {
            id
            status
            entryGeo {
                data {
                    geoids {
                        countrycode
                        featurecode
                        geonameid
                        latitude
                        longitude
                        match
                    }
                }
            }
        }
    }
}
`;

interface Props {
    projectId: string;
    nlpMapId: string | undefined;
}

function NlpMap(props: Props) {
    const {
        projectId,
        nlpMapId,
    } = props;

    const {
        data,
        loading,
        startPolling,
        stopPolling,
        error,
    } = useQuery<NlpMapQuery, NlpMapQueryVariables>(
        NLP_MAP,
        {
            skip: !nlpMapId,
            variables: nlpMapId ? {
                projectId,
                nlpMapId,
            } : undefined,
        },
    );

    useEffect(
        () => {
            const shouldPoll = data?.project?.analysisGeoTask?.status === 'PENDING'
                || data?.project?.analysisGeoTask?.status === 'STARTED';

            if (shouldPoll) {
                startPolling(5000);
            } else {
                stopPolling();
            }
            return (() => {
                stopPolling();
            });
        },
        [
            data?.project?.analysisGeoTask?.status,
            startPolling,
            stopPolling,
        ],
    );

    const points = useMemo(() => {
        const latLongs = data?.project?.analysisGeoTask?.entryGeo
            ?.flatMap((geoData) => geoData?.data)
            .flatMap((mapData) => mapData?.geoids)
            .filter(isDefined)
            .map((latLong) => ((latLong.latitude && latLong.longitude) ? {
                count: 1,
                centroid: {
                    type: 'Point' as const,
                    coordinates: [latLong.longitude, latLong.latitude] as GeoJSON.Position,
                },
            } : undefined))
            .filter(isDefined);

        return latLongs;
    }, [data?.project?.analysisGeoTask]);

    if (data?.project?.analysisGeoTask?.status === 'SEND_FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="The NLP service is not responding at the moment. Please try again after some time."
                    icon={(<Kraken variant="sleep" />)}
                />
            </div>
        );
    }

    if (isDefined(error) || data?.project?.analysisGeoTask?.status === 'FAILED') {
        return (
            <div className={styles.message}>
                <Message
                    message="There was an error while extracting geo locations from the entries."
                    icon={(<Kraken variant="icecream" />)}
                />
            </div>
        );
    }

    const pending = loading
        || data?.project?.analysisGeoTask?.status === 'STARTED'
        || data?.project?.analysisGeoTask?.status === 'PENDING';

    if (pending) {
        return (
            <PendingMessage />
        );
    }

    return (
        <div className={styles.map}>
            {(data?.project?.analysisGeoTask?.entryGeo?.length ?? 0) > 0 ? (
                <HeatMap
                    className={styles.mapContainer}
                    points={points}
                    defaultZoom={0}
                />
            ) : (
                <div className={styles.message}>
                    <Message
                        message="We couldn't extract geo data from the entries. Please add more entries and try again."
                        icon={(<Kraken variant="crutches" />)}
                    />
                </div>
            )}
        </div>
    );
}

export default NlpMap;
