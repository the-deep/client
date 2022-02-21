import React from 'react';
import {
    Redirect,
    generatePath,
    useParams,
} from 'react-router-dom';

import routes from '#base/configs/routes';

interface EntryEditParams {
    projectId: string | undefined;
    leadId: string | undefined;
    entryId: string | undefined;
}

function EntryEditRedirect() {
    const { projectId, leadId, entryId } = useParams<EntryEditParams>();
    const editEntryLink = (projectId && leadId) ? ({
        pathname: (generatePath(routes.entryEdit.path, {
            projectId,
            leadId,
        })),
        state: {
            entryServerId: entryId,
            activePage: 'primary',
        },
        hash: '#/primary-tagging',
    }) : routes.fourHundredFour.path;

    return (
        <Redirect to={editEntryLink} />
    );
}

export default EntryEditRedirect;
