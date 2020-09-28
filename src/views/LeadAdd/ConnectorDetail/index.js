import React, { useState, useMemo } from 'react';
import { _cs } from '@togglecorp/fujs';
import PropTypes from 'prop-types';

import LeadPreview from '#components/leftpanel/LeadPreview';
import Message from '#rscv/Message';

import _ts from '#ts';

import ConnectorLeadList from '../ConnectorLeadList';
import {
    LEAD_TYPE,
} from '../utils';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    pending: PropTypes.bool,
    leads: PropTypes.array, // eslint-disable-line react/forbid-prop-types
};

const defaultProps = {
    leads: [],
    className: undefined,
    pending: false,
};

function ConnectorDetail(props) {
    const {
        className,
        leads,
        pending,
    } = props;

    // TODO: validate this selected connector lead
    const [selectedConnectorLead, setSelectedConnectorLead] = useState(undefined);

    const activeConnectorLead = useMemo(
        () => {
            if (!selectedConnectorLead) {
                return undefined;
            }
            const connectorLead = leads?.find(
                item => item.id === selectedConnectorLead
            );
            if (!connectorLead) {
                return undefined;
            }

            return {
                sourceType: LEAD_TYPE.website,
                // FIXME: use lead.data.url or lead.url
                url: connectorLead.lead.url,
                // attachment: connectorLead.lead.data.attachment,
            };
        },
        [leads, selectedConnectorLead],
    );

    return (
        <div className={_cs(styles.connectorDetail, className)}>
            <ConnectorLeadList
                className={styles.list}
                activeLeadKey={selectedConnectorLead}
                onLeadClick={setSelectedConnectorLead}
                leads={leads}
                pending={pending}
            />
            {activeConnectorLead ? (
                <LeadPreview
                    className={styles.leadDetail}
                    lead={activeConnectorLead}
                />
            ) : (
                <Message>
                    { _ts('addLeads', 'noLeadsText') }
                </Message>
            )}
        </div>
    );
}

ConnectorDetail.propTypes = propTypes;
ConnectorDetail.defaultProps = defaultProps;

export default ConnectorDetail;
