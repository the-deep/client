import React from 'react';
import { reverseRoute } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import ButtonLikeLink from '#components/general/ButtonLikeLink';

import { pathNames } from '#constants';

interface EntryOpenLinkProps {
    className?: string;
    entryId: number;
    projectId: number;
    leadId: number;
    disabled?: boolean;
}

// TODO: implement this properly
function EntryOpenLink(props: EntryOpenLinkProps) {
    const {
        className,
        projectId,
        leadId,
        entryId,
        disabled,
    } = props;

    const route = React.useMemo(() => ({
        pathname: reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        }),
        search: `?entry_id=${entryId}`,
    }), [projectId, leadId, entryId]);

    return (
        <ButtonLikeLink
            className={className}
            to={route}
            disabled={disabled}
        >
            <Icon
                name="externalLink"
            />
        </ButtonLikeLink>
    );
}

export default EntryOpenLink;
