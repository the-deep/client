import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '../../../../vendor/react-store/utils/common';
import Table from '../../../../vendor/react-store/components/View/Table';
import Modal from '../../../../vendor/react-store/components/View/Modal';
import Confirm from '../../../../vendor/react-store/components/View/Modal/Confirm';
import ModalHeader from '../../../../vendor/react-store/components/View/Modal/Header';
import ModalBody from '../../../../vendor/react-store/components/View/Modal/Body';
import ModalFooter from '../../../../vendor/react-store/components/View/Modal/Footer';
import Button from '../../../../vendor/react-store/components/Action/Button';
import DangerButton from '../../../../vendor/react-store/components/Action/Button/DangerButton';
import WarningButton from '../../../../vendor/react-store/components/Action/Button/WarningButton';
import {
    linkCollectionSelector,
} from '../../../../redux';

import { iconNames } from '../../../../constants';

import DeleteConfirm from '../../DeleteConfirm';
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

        this.state = {
            editStringId: undefined,
            deleteStringId: undefined,
            showDeleteStringConfirmModal: false,
            showEditStringModal: false,
        };

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
                modifier: data => (
                    <Fragment>
                        <WarningButton
                            onClick={() => { this.handleEditButtonClick(data.stringId); }}
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                        />
                        <DangerButton
                            onClick={() => { this.handleDeleteButtonClick(data.stringId); }}
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
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

    handleEditButtonClick = (stringId) => {
        this.setState({
            editStringId: stringId,
            showEditStringModal: true,
        });
    }

    handleDeleteButtonClick = (stringId) => {
        this.setState({
            deleteStringId: stringId,
            showDeleteStringConfirmModal: true,
        });
    }

    handleDeleteStringConfirmClose = () => {
        this.setState({ showDeleteStringConfirmModal: false });
    }

    render() {
        const { linkCollection } = this.props;
        const {
            showDeleteStringConfirmModal,
            deleteStringId,
        } = this.state;

        return (
            <React.Fragment>
                <Table
                    className={styles.linksTable}
                    data={linkCollection}
                    headers={this.linksTableHeader}
                    keyExtractor={LinksTable.keyExtractor}
                    defaultSort={this.linksTableDefaultSort}
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
