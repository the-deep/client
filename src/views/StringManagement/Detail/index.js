import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PrimaryButton from '#rs/components/Action/Button/PrimaryButton';
import SuccessButton from '#rs/components/Action/Button/SuccessButton';
import DangerButton from '#rs/components/Action/Button/DangerButton';
import LoadingAnimation from '#rs/components/View/LoadingAnimation';
import Confirm from '#rs/components/View/Modal/Confirm';
import SelectInput from '#rs/components/Input/SelectInput';

import {
    setLanguageAction,
    stringMgmtSetSelectedLanguageAction,

    availableLanguagesSelector,
    selectedLanguageNameSelector,
    selectedLinkCollectionNameSelector,
    stringMgmtClearChangesAction,

    hasSelectedLanguageChangesSelector,
} from '#redux';

import EditStringModal from './EditStringModal';
import StringsTable from './StringsTable';
import LinksTable from './LinksTable';
import InfoPane from './InfoPane';

import styles from './styles.scss';

const propTypes = {
    selectedLanguageName: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    availableLanguages: PropTypes.array.isRequired,

    setSelectedLanguage: PropTypes.func.isRequired,
    pendingLanguage: PropTypes.bool.isRequired,
    linkCollectionName: PropTypes.string.isRequired,
    clearChanges: PropTypes.func.isRequired,
    hasSelectedLanguageChanges: PropTypes.bool.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    availableLanguages: availableLanguagesSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
    linkCollectionName: selectedLinkCollectionNameSelector(state),
    hasSelectedLanguageChanges: hasSelectedLanguageChangesSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedLanguage: params => dispatch(stringMgmtSetSelectedLanguageAction(params)),
    setLanguage: params => dispatch(setLanguageAction(params)),
    clearChanges: params => dispatch(stringMgmtClearChangesAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        this.state = {
            showAddStringModal: false,
            showDiscardModal: false,
        };
    }

    handleAddButtonClick = () => {
        this.setState({ showAddStringModal: true });
    }

    handleAddStringClose = () => {
        this.setState({ showAddStringModal: false });
    }

    handleDiscardButtonClick = () => {
        this.setState({ showDiscardModal: true });
    }

    handleDiscardConfirmClose = (confirm) => {
        if (confirm) {
            const { selectedLanguageName } = this.props;
            this.props.clearChanges(selectedLanguageName);
        }
        this.setState({ showDiscardModal: false });
    }

    renderHeader = () => {
        const keySelector = d => d.code;
        const labelSelector = d => d.title;

        const {
            setSelectedLanguage,
            availableLanguages,
            selectedLanguageName,
            linkCollectionName,
            hasSelectedLanguageChanges,
        } = this.props;

        const {
            showAddStringModal,
            showDiscardModal,
        } = this.state;

        return (
            <header className={styles.header}>
                <div className={styles.inputs}>
                    <h3>
                        {linkCollectionName === '$all' ? 'all' : linkCollectionName}
                    </h3>
                </div>
                <div className={styles.actionButtons}>
                    <SelectInput
                        keySelector={keySelector}
                        labelSelector={labelSelector}
                        onChange={setSelectedLanguage}
                        options={availableLanguages}
                        value={selectedLanguageName}
                        label="Selected Language"
                        placeholder="Default"
                        showHintAndError={false}
                        hideClearButton
                    />
                    <PrimaryButton
                        onClick={this.handleAddButtonClick}
                    >
                        Add new string
                    </PrimaryButton>
                    <DangerButton
                        onClick={this.handleDiscardButtonClick}
                        disabled={!hasSelectedLanguageChanges}
                    >
                        Discard
                    </DangerButton>
                    <SuccessButton
                        disabled={!hasSelectedLanguageChanges}
                    >
                        Save
                    </SuccessButton>
                    { showAddStringModal &&
                        <EditStringModal
                            onClose={this.handleAddStringClose}
                        />
                    }
                    <Confirm
                        show={showDiscardModal}
                        closeOnEscape
                        onClose={this.handleDiscardConfirmClose}
                    >
                        <p>
                            Do you want to discard all changes?
                        </p>
                    </Confirm>
                </div>
            </header>
        );
    }

    render() {
        const {
            pendingLanguage,
            linkCollectionName,
        } = this.props;

        const Header = this.renderHeader;

        return (
            <div className={styles.rightPane}>
                { pendingLanguage && <LoadingAnimation /> }
                <Header />
                <div className={styles.content}>
                    <div className={styles.scrollWrapper}>
                        { linkCollectionName === '$all' ? <StringsTable /> : <LinksTable /> }
                    </div>
                    <InfoPane />
                </div>
            </div>
        );
    }
}
