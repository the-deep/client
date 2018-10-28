import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    linkCollectionSelector,
    allStringsSelector,
    selectedLanguageNameSelector,
    stringMgmtAddStringChangeAction,
    stringMgmtAddLinkChangeAction,
    selectedLinkCollectionNameSelector,
} from '#redux';

import Confirm from '#rscv/Modal/Confirm';
import ListView from '#rscv/List/ListView';
import styles from './styles.scss';

const propTypes = {
    deleteId: PropTypes.oneOfType([
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
    selectedLinkCollectionName: PropTypes.string.isRequired,
    addStringChange: PropTypes.func.isRequired,
    addLinkChange: PropTypes.func.isRequired,
};

const defaultProps = {
    deleteId: undefined,
};

const mapStateToProps = state => ({
    linkCollection: linkCollectionSelector(state),
    allStrings: allStringsSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
    selectedLinkCollectionName: selectedLinkCollectionNameSelector(state),
});


const mapDispatchToProps = dispatch => ({
    addStringChange: params => dispatch(stringMgmtAddStringChangeAction(params)),
    addLinkChange: params => dispatch(stringMgmtAddLinkChangeAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class DeleteConfirm extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    handleDeleteStringConfirmClose = (result) => {
        const {
            type,
            deleteId,
            selectedLanguageName,

            allStrings,
            linkCollection,

            addStringChange,
            addLinkChange,
        } = this.props;

        if (result && type === 'all') {
            const value = allStrings.find(str => str.id === deleteId).string;
            const change = {
                id: deleteId,
                oldValue: value,
                action: 'delete',
            };
            addStringChange({
                change,
                languageName: selectedLanguageName,
            });
        } else if (result && type === 'link') {
            const value = linkCollection.find(lnk => lnk.id === deleteId).stringId;
            const change = {
                key: deleteId,
                oldString: value,
                action: 'delete',
            };
            addLinkChange({
                change,
                linkCollectionName: this.props.selectedLinkCollectionName,
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
            deleteId: id,
            linkCollection,
            allStrings,
        } = this.props;

        let properties = [];

        switch (type) {
            case 'link': {
                const string = linkCollection.find(d => d.id === id);
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
                const string = allStrings.find(d => d.id === id);
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

        // FIXME: use ConfirmButton
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
