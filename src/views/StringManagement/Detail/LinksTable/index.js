import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    compareStringByWordCount,
    compareString,
    compareNumber,
} from '@togglecorp/fujs';
import Table from '#rscv/Table';
import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import Button from '#rsca/Button';
import {
    linkCollectionSelector,
} from '#redux';

import { iconNames } from '#constants';

import DeleteConfirm from '../DeleteConfirm';
import EditLinkModal from '../EditLinkModal';
import EditStringModal from '../EditStringModal';
import styles from './styles.scss';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,
    disabled: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    linkCollection: linkCollectionSelector(state),
});

@connect(mapStateToProps)
export default class LinksTable extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static keySelector = e => e.id;

    constructor(props) {
        super(props);

        this.state = {
            editLinkId: undefined,
            deleteLinkId: undefined,
            showDeleteLinkConfirmModal: false,
            showEditLinkModal: false,

            editStringId: undefined,
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
                        <Button
                            onClick={() => { this.handleEditStringButtonClick(data.stringId); }}
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                            disabled={this.props.disabled}
                        />
                        <WarningButton
                            onClick={() => { this.handleEditButtonClick(data.id); }}
                            iconName={iconNames.edit}
                            transparent
                            smallVerticalPadding
                            disabled={this.props.disabled}
                        />
                        <DangerButton
                            onClick={() => { this.handleDeleteButtonClick(data.id); }}
                            iconName={iconNames.delete}
                            transparent
                            smallVerticalPadding
                            disabled={this.props.disabled}
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

    handleEditButtonClick = (id) => {
        this.setState({
            editLinkId: id,
            showEditLinkModal: true,
        });
    }

    handleEditStringButtonClick = (stringId) => {
        this.setState({
            editStringId: stringId,
            showEditStringModal: true,
        });
    }

    handleDeleteButtonClick = (id) => {
        this.setState({
            deleteLinkId: id,
            showDeleteLinkConfirmModal: true,
        });
    }

    handleDeleteLinkConfirmClose = () => {
        this.setState({ showDeleteLinkConfirmModal: false });
    }

    handleEditLinkModalClose = () => {
        this.setState({ showEditLinkModal: false });
    }

    handleEditStringClose = () => {
        this.setState({
            showEditStringModal: false,
        });
    }

    render() {
        const { linkCollection } = this.props;
        const {
            showDeleteLinkConfirmModal,
            deleteLinkId,
            showEditLinkModal,
            editLinkId,
            editStringId,
            showEditStringModal,
        } = this.state;

        return (
            <React.Fragment>
                <Table
                    className={styles.linksTable}
                    data={linkCollection}
                    headers={this.linksTableHeader}
                    keySelector={LinksTable.keySelector}
                    defaultSort={this.linksTableDefaultSort}
                />
                <DeleteConfirm
                    show={showDeleteLinkConfirmModal}
                    deleteId={deleteLinkId}
                    type="link"
                    onClose={this.handleDeleteLinkConfirmClose}
                />
                { showEditLinkModal &&
                    <EditLinkModal
                        editLinkId={editLinkId}
                        onClose={this.handleEditLinkModalClose}
                    />
                }
                { showEditStringModal &&
                    <EditStringModal
                        editStringId={editStringId}
                        onClose={this.handleEditStringClose}
                    />
                }
            </React.Fragment>
        );
    }
}
