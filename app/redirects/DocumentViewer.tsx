import React from 'react';
import {
    Redirect,
    generatePath,
    useParams,
} from 'react-router-dom';

import routes from '#base/configs/routes';

interface DocumentViewerParams {
    leadHash: string | undefined;
}

function DocumentViewerRedirect() {
    const { leadHash } = useParams<DocumentViewerParams>();
    const documentViewerLink = (leadHash) ? ({
        pathname: (generatePath(routes.documentViewer.path, { leadHash })),
    }) : routes.fourHundredFour.path;

    return (
        <Redirect to={documentViewerLink} />
    );
}

export default DocumentViewerRedirect;
