import PropTypes from 'prop-types';
import React from 'react';
import memoize from 'memoize-one';
import { Link } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import modalize from '#rscg/Modalize';
import Icon from '#rscg/Icon';
import Button from '#rsca/Button';
import WarningButton from '#rsca/Button/WarningButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';

import { pathNames } from '#constants';
import Cloak from '#components/general/Cloak';
import LeadCopyModal from '#components/general/LeadCopyModal';
import _ts from '#ts';
import _cs from '#cs';

import LeadEditModal from '#components/general/LeadEditModal';

import styles from './styles.scss';

const ModalButton = modalize(Button);
const ModalWarningButton = modalize(WarningButton);

const propTypes = {
    className: PropTypes.string,
    row: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    activeProject: PropTypes.number.isRequired,
    onSearchSimilarLead: PropTypes.func.isRequired,
    onRemoveLead: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

const defaultProps = {
    className: '',
    disabled: false,
};

export default class ActionButtons extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideLeadDelete = ({ leadPermissions }) => !leadPermissions.delete
    static shouldHideLeadEdit = ({ leadPermissions }) => !leadPermissions.modify
    static shouldHideLeadCopy = ({ leadPermissions }) =>
        !leadPermissions.modify || !leadPermissions.create


    static shouldHideEntryAdd = ({ hasAnalysisFramework, entryPermissions }) => (
        !hasAnalysisFramework || !(entryPermissions.create || entryPermissions.modify)
    )

    static shouldHideAssessmentAdd = ({ hasAssessmentTemplate, assessmentPermissions }) => (
        !hasAssessmentTemplate || !(assessmentPermissions.create || assessmentPermissions.modify)
    )

    getLinks = () => {
        const {
            activeProject,
            row,
        } = this.props;

        const editEntries = reverseRoute(
            pathNames.editEntries,
            {
                projectId: activeProject,
                leadId: row.id,
            },
        );

        const addAssessment = reverseRoute(
            pathNames.editAry,
            {
                projectId: activeProject,
                leadId: row.id,
            },
        );

        const editLead = {
            pathname: reverseRoute(
                pathNames.addLeads,
                {
                    projectId: activeProject,
                },
            ),
            state: {
                lead: row,
            },
        };

        return {
            editLead,
            addAssessment,
            editEntries,
        };
    }

    // NOTE: This is sent as an array as LeadCopyModal is built for bulk operations
    getLeadIds = memoize(row => [row.id]);

    render() {
        const links = this.getLinks();
        const {
            onSearchSimilarLead,
            onRemoveLead,
            row,
            className,
            disabled,
        } = this.props;

        const containerClassName = _cs(
            className,
            styles.actionButtons,
            'action-buttons',
        );

        const leadIds = this.getLeadIds(row);

        return (
            <div className={containerClassName}>
                <div className={styles.actionGroup}>
                    <Cloak
                        hide={ActionButtons.shouldHideLeadCopy}
                        render={
                            <ModalButton
                                tabIndex="-1"
                                title={_ts('leads', 'exportToOtherProjectsButtonTitle')}
                                transparent
                                iconName="openLink"
                                disabled={disabled}
                                modal={
                                    <LeadCopyModal leads={leadIds} />
                                }
                            />
                        }
                    />
                    <Button
                        tabIndex="-1"
                        title={_ts('leads', 'searchSimilarLeadButtonTitle')}
                        onClick={() => onSearchSimilarLead(row)}
                        transparent
                        iconName="search"
                        disabled={disabled}
                    />
                    <Cloak
                        hide={ActionButtons.shouldHideLeadDelete}
                        render={
                            <DangerConfirmButton
                                tabIndex="-1"
                                title={_ts('leads', 'removeLeadLeadButtonTitle')}
                                onClick={() => onRemoveLead(row)}
                                transparent
                                iconName="delete"
                                confirmationMessage={_ts('leads', 'leadDeleteConfirmText')}
                                disabled={disabled}
                            />
                        }
                    />
                    <Cloak
                        hide={ActionButtons.shouldHideLeadEdit}
                        render={
                            <ModalWarningButton
                                iconName="edit"
                                transparent
                                disabled={disabled}
                                modal={
                                    <LeadEditModal
                                        leadId={row.id}
                                        lead={row}
                                    />
                                }
                            />
                        }
                    />
                </div>
                <div className={styles.actionGroup}>
                    <Cloak
                        hide={ActionButtons.shouldHideAssessmentAdd}
                        render={
                            <Link
                                className={styles.addAssessmentLink}
                                tabIndex="-1"
                                title={_ts('leads', 'addAssessmentFromLeadButtonTitle')}
                                to={links.addAssessment}
                            >
                                <Icon name="forward" />
                            </Link>
                        }
                    />
                    <Cloak
                        hide={ActionButtons.shouldHideEntryAdd}
                        render={
                            <Link
                                className={styles.addEntryLink}
                                tabIndex="-1"
                                title={_ts('leads', 'addEntryFromLeadButtonTitle')}
                                to={links.editEntries}
                            >
                                <Icon name="forward" />
                            </Link>
                        }
                    />
                </div>
            </div>
        );
    }
}
