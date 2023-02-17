import React from 'react';
import { useQuery, gql } from '@apollo/client';

import {
    YearlySnapshotsQuery,
} from '#generated/types';

const YEARLY_SNAPSHOTS = gql`
query YearlySnapshots {
    publicDeepExploreYearlySnapshots {
        downloadFile {
            name
            url
        }
        file {
            name
            url
        }
        id
        year
    }
}`;

interface Props {
    className?: string;
}

function PublicExploreDeep(props: Props) {
    const {
        className,
    } = props;

    const {
        data,
        loading,
    } = useQuery<YearlySnapshotsQuery>(
        YEARLY_SNAPSHOTS,
    );

    // eslint-disable-next-line no-console
    console.warn('here', data, loading);

    return (
        <div className={className}>
            Public Explore Deep
        </div>
    );
}

export default PublicExploreDeep;
