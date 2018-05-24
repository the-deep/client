import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    linkCollectionSelector,
    allStringsSelector,
} from '../../../redux';

import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import styles from './styles.scss';

const propTypes = {
    deleteStringId: PropTypes.number,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
};

const defaultProps = {
    deleteStringId: undefined,
};

const mapStateToProps = (state, props) => ({
    linkCollection: linkCollectionSelector(state, props),
    allStrings: allStringsSelector(state),
});

@connect(mapStateToProps)
export default class DeleteConfirm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDeleteStringConfirmClose = (result) => {
        if (result) {
            const { deleteStringId } = this.state;
            // TODO add real delete action
            // deleteString(deleteStringId);
            console.warn('Delete string', deleteStringId);
        }

        const { onClose } = this.props;
        onClose(result);
    }

    renderMessageDetails = () => {
        const {
            type,
            deleteStringId: id,
            linkCollection,
            allStrings,
        } = this.props;

        const strings = {
            link: linkCollection,
        };

        switch (type) {
            case 'link': {
                const string = strings[type].find(d => d.stringId === id);

                if (!string) {
                    return null;
                }
                const properties = [
                    { label: 'ID', value: string.id },
                    { label: 'String ID', value: string.stringId },
                    { label: 'String', value: string.string },
                ];

                return (
                    <div className={styles.properties}>
                        {
                            properties.map(property => (
                                <div
                                    className={styles.property}
                                    key={property.label}
                                >
                                    <div className={styles.label}>
                                        { property.label }
                                    </div>
                                    <div className={styles.value}>
                                        { property.value }
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                );
            }

            case 'all': {
                console.warn(allStrings);
                return null;
            }

            default:
                return null;
        }
    };

    render() {
        const { show } = this.props;

        if (!show) {
            return null;
        }

        const confirmationTitle = 'Delete string';
        const confirmationMessage = 'Are you sure you want to delete the string?';
        const MessageDetails = this.renderMessageDetails;

        return (
            <Confirm
                show
                title={confirmationTitle}
                onClose={this.handleDeleteStringConfirmClose}
            >
                <div className={styles.message}>
                    { confirmationMessage }
                </div>
                <MessageDetails />
            </Confirm>
        );
    }
}
