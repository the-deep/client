import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { reverseRoute } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import FormattedDate from '#rscv/FormattedDate';
import ListView from '#rscv/List/ListView';

import Cloak from '#components/general/Cloak';
import {
    pathNames,
    viewsAcl,
} from '#constants';
import _ts from '#ts';

import Entry from './Entry';
import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    headerClassName: PropTypes.string,
    projectId: PropTypes.number.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    widgets: PropTypes.array.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    lead: PropTypes.object.isRequired,
};

const defaultProps = {
    className: '',
    headerClassName: '',
};

const entryKeySelector = d => d.id;

export default class LeadGroupedEntries extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldHideEntryEdit = ({ entryPermissions }) => (
        !entryPermissions.modify && !entryPermissions.create && !entryPermissions.delete
    )

    getEntryParams = (_, entry) => ({
        entry,
        widgets: this.props.widgets,
    });

    renderHeader = () => {
        const {
            projectId,
            headerClassName,
            lead: {
                title: leadTitle,
                id: leadId,
                createdAt: leadCreatedAt,
                entries,
            },
        } = this.props;

        const route = reverseRoute(pathNames.editEntries, {
            projectId,
            leadId,
        });

        const className = `
            ${headerClassName}
            ${styles.header}
        `;

        // {_ts('entries', 'editEntryButtonLabel')}
        return (
            <header className={className}>
                <h3
                    title={leadTitle}
                    className={styles.heading}
                >
                    <div className={styles.title}>
                        { leadTitle }
                    </div>
                    <FormattedDate
                        className={styles.date}
                        date={leadCreatedAt}
                        mode="dd-MM-yyyy"
                    />
                </h3>
                <div
                    title={_ts('entries', 'numberOfEntriesTooltip')}
                    className={styles.numberOfEntries}
                >
                    {/* FIXME: string */}
                    <strong>{ entries.length }</strong> entries
                </div>
                <Cloak
                    {...viewsAcl.editEntries}
                    render={
                        <Link
                            className={styles.editEntryLink}
                            title={_ts('entries', 'editEntryLinkTitle')}
                            to={route}
                        >
                            <Icon name="edit" />
                        </Link>
                    }
                />
            </header>
        );
    }

    renderEntries = () => {
        const {
            lead: {
                entries,
            },
        } = this.props;

        return (
            <ListView
                className={styles.entryList}
                data={entries}
                renderer={Entry}
                rendererParams={this.getEntryParams}
                keySelector={entryKeySelector}
            />
        );
    }

    render() {
        const { className: classNameFromProps } = this.props;

        const Header = this.renderHeader;
        const Entries = this.renderEntries;

        const className = `
            ${classNameFromProps}
            ${styles.leadGroupedEntries}
        `;

        return (
            <div className={className}>
                <Header />
                <Entries />
            </div>
        );
    }
}
