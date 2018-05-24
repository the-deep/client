import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareBoolean,
    compareStringAsNumber,
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../../../vendor/react-store/utils/common';
import Table from '../../../../vendor/react-store/components/View/Table';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import { allStringsSelector } from '../../../../redux';

import DeleteConfirm from '../../DeleteConfirm';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    allStrings: allStringsSelector(state),
});

@connect(mapStateToProps)
export default class StringsTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;

    constructor(props) {
        super(props);

        this.state = {
            editStringId: undefined,
            deleteStringId: undefined,
            showDeleteStringConfirmModal: false,
            showEditStringModal: false,
        };

        this.stringsTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareStringAsNumber(a.id, b.id),
            },
            {
                key: 'string',
                label: 'String',
                order: 2,
                sortable: true,
                comparator: (a, b) => (
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 3,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
            },
            {
                key: 'duplicates',
                label: 'Duplicates',
                order: 4,
                sortable: true,
                comparator: (a, b) => (
                    compareBoolean(!!a.duplicates, !!b.duplicates, -1) ||
                    compareStringByWordCount(a.string, b.string) ||
                    compareString(a.string, b.string)
                ),
                modifier: a => (a.duplicates ? a.duplicates : '-'),
            },
            {
                key: 'actions',
                label: 'Actions',
                order: 5,
                modifier: () => (
                    <Fragment>
                        <WarningButton
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                        <DangerButton
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
                            disabled
                        />
                    </Fragment>
                ),
            },
        ];

        this.stringsTableDefaultSort = {
            key: 'string',
            order: 'asc',
        };
    }

    render() {
        const { allStrings } = this.props;
        const {
            showDeleteStringConfirmModal,
            deleteStringId,
        } = this.state;

        return (
            <React.Fragment>
                <Table
                    className={styles.stringsTable}
                    data={allStrings}
                    headers={this.stringsTableHeader}
                    keyExtractor={StringsTable.keyExtractor}
                    defaultSort={this.stringsTableDefaultSort}
                />
                <DeleteConfirm
                    show={showDeleteStringConfirmModal}
                    deleteStringId={deleteStringId}
                    type="link"
                    onClose={this.handleDeleteStringConfirmClose}
                />
            </React.Fragment>
        );
    }
}
