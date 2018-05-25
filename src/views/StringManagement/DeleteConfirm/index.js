import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    linkCollectionSelector,
    allStringsSelector,
    selectedLanguageNameSelector,
    stringMgmtAddStringChangeAction,
} from '../../../redux';

import Confirm from '../../../vendor/react-store/components/View/Modal/Confirm';
import ListView from '../../../vendor/react-store/components/View/List/ListView';
import styles from './styles.scss';

const propTypes = {
    deleteStringId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
    ]),
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    linkCollection: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    allStrings: PropTypes.array.isRequired,
    selectedLanguageName: PropTypes.string.isRequired,
    addStringChange: PropTypes.func.isRequired,
};

const defaultProps = {
    deleteStringId: undefined,
};

const mapStateToProps = (state, props) => ({
    linkCollection: linkCollectionSelector(state, props),
    allStrings: allStringsSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
});


const mapDispatchToProps = dispatch => ({
    addStringChange: params => dispatch(stringMgmtAddStringChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class DeleteConfirm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDeleteStringConfirmClose = (result) => {
        const {
            type,
            allStrings,
            deleteStringId,
            selectedLanguageName,
            addStringChange,
        } = this.props;
        if (result && type === 'all') {
            const value = allStrings.find(
                str => str.id === deleteStringId,
            ).string;
            const change = {
                id: deleteStringId,
                oldValue: value,
                action: 'delete',
            };
            addStringChange({
                change,
                languageName: selectedLanguageName,
            });
        }

        const { onClose } = this.props;
        onClose(result);
    }

    renderProperty = (k, property) => (
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
    );

    renderMessageDetails = () => {
        const {
            type,
            deleteStringId: id,
            linkCollection,
            allStrings,
        } = this.props;

        const strings = {
            link: linkCollection,
            all: allStrings,
        };

        let properties = [];

        switch (type) {
            case 'link': {
                const string = strings[type].find(d => String(d.stringId) === String(id));
                if (string) {
                    properties = [
                        { label: 'ID', value: string.id },
                        { label: 'String ID', value: string.stringId },
                        { label: 'String', value: string.string },
                    ];
                }
                break;
            }
            case 'all': {
                console.warn(strings[type]);
                const string = strings[type].find(d => String(d.id) === String(id));
                if (string) {
                    properties = [
                        { label: 'ID', value: string.id },
                        { label: 'String', value: string.string },
                    ];
                }
                break;
            }

            default:
                return null;
        }

        return (
            <ListView
                className={styles.properties}
                data={properties}
                modifier={this.renderProperty}
            />
        );
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
