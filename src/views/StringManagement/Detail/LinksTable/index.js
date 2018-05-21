import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../../../vendor/react-store/utils/common';
import Table from '../../../../vendor/react-store/components/View/Table';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import {
    linkCollectionSelector,
} from '../../../../redux';

import { iconNames } from '../../../../constants';

import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,
};

const defaultProps = {
};

const mapStateToProps = (state, props) => ({
    linkCollection: linkCollectionSelector(state, props),
});

@connect(mapStateToProps)
export default class LinksTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keyExtractor = e => e.id;

    constructor(props) {
        super(props);

        this.linksTableHeader = [
            {
                key: 'id',
                label: 'Id',
                order: 1,
                sortable: true,
                comparator: (a, b) => compareString(a.id, b.id),
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
                key: 'stringId',
                label: 'String Id',
                order: 3,
                sortable: false,
            },
            {
                key: 'refs',
                label: 'Refs',
                order: 4,
                sortable: true,
                comparator: (a, b) => compareNumber(a.refs, b.refs),
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

        this.linksTableDefaultSort = {
            key: 'id',
            order: 'asc',
        };
    }

    render() {
        const { linkCollection } = this.props;

        return (
            <Table
                className={styles.linksTable}
                data={linkCollection}
                headers={this.linksTableHeader}
                keyExtractor={LinksTable.keyExtractor}
                defaultSort={this.linksTableDefaultSort}
            />
        );
    }
}
