import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';

import { formatTitle } from '#utils/common';

import {
    LEAD_TYPE,
    supportedFileTypes,
    getNewLeadKey,
} from '../utils';

import { CandidateLeadsManagerContext } from '../CandidateLeadsManager';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: undefined,
};

// FIXME: Name is not clear enough
function DroppableDiv(p) {
    const {
        className,
        children,
    } = p;

    const { addCandidateLeads } = useContext(CandidateLeadsManagerContext);

    const {
        acceptedFiles,
        getRootProps,
    } = useDropzone({ accept: supportedFileTypes });

    React.useEffect(() => {
        const leads = acceptedFiles.map((file) => {
            const lead = {
                key: getNewLeadKey(),
                data: {
                    title: formatTitle(file.name),
                    sourceType: LEAD_TYPE.file,
                },
                file,
            };
            return lead;
        });
        if (leads.length > 0) {
            addCandidateLeads(leads);
        }
    }, [acceptedFiles, addCandidateLeads]);

    return (
        <div {...getRootProps({ className })}>
            { children }
        </div>
    );
}
DroppableDiv.defaultProps = defaultProps;
DroppableDiv.propTypes = propTypes;

export default DroppableDiv;
