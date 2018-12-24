import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import SuccessButton from '#rsca/Button/SuccessButton';
import DangerConfirmButton from '#rsca/ConfirmButton/DangerConfirmButton';
import LoadingAnimation from '#rscv/LoadingAnimation';
import SelectInput from '#rsci/SelectInput';

import {
    setLanguageAction,
    stringMgmtSetSelectedLanguageAction,

    availableLanguagesSelector,
    selectedLanguageNameSelector,
    selectedLinkCollectionNameSelector,
    stringMgmtClearChangesAction,

    hasSelectedLanguageChangesSelector,
    hasInvalidChangesSelector,

    selectedLanguageStringsChangesSelector,
    selectedLanguageLinksChangesSelector,

    selectedStringsFilteredSelector,
    selectedLinksFilteredSelector,
} from '#redux';
import { isProduction } from '#config/env';

import LanguagePut from '../requests/LanguagePut';
import EditStringModal from './EditStringModal';
import StringsTable from './StringsTable';
import LinksTable from './LinksTable';
import InfoPane from './InfoPane';
import DevLangSave from './requests/DevLangSave';

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
    hasInvalidChanges: PropTypes.bool.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    selectedLanguageStringsChanges: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectedLanguageLinksChanges: PropTypes.object.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    selectedLanguageStrings: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectedLanguageLinks: PropTypes.object.isRequired,

    setLanguage: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    availableLanguages: availableLanguagesSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
    linkCollectionName: selectedLinkCollectionNameSelector(state),
    hasSelectedLanguageChanges: hasSelectedLanguageChangesSelector(state),
    hasInvalidChanges: hasInvalidChangesSelector(state),
    selectedLanguageStringsChanges: selectedLanguageStringsChangesSelector(state),
    selectedLanguageLinksChanges: selectedLanguageLinksChangesSelector(state),

    selectedLanguageStrings: selectedStringsFilteredSelector(state),
    selectedLanguageLinks: selectedLinksFilteredSelector(state),
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
            pendingLanguagePut: false,
        };
    }

    componentWillUnmount() {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }
        if (this.devLangSaveRequest) {
            this.devLangSaveRequest.stop();
        }
    }

    createLanguageRequest = (languageCode, strings, links) => {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }

        const request = new LanguagePut({
            setState: params => this.setState(params),
            setLanguage: this.props.setLanguage,
            clearChanges: () => this.props.clearChanges(languageCode),
        });
        this.languageRequest = request.create(languageCode, strings, links);
        this.languageRequest.start();
    }

    startDevLangSaveRequest = (languageCode, strings, links) => {
        if (this.devLangSaveRequest) {
            this.devLangSaveRequest.stop();
        }

        this.devLangSaveRequest = new DevLangSave({
            setState: params => this.setState(params),
            clearChanges: () => this.props.clearChanges(languageCode),
        });

        this.devLangSaveRequest.init(strings, links);
        this.devLangSaveRequest.start();
    }

    handleSaveButtonClick = () => {
        const {
            selectedLanguageName: languageCode,
            selectedLanguageStringsChanges: strings,
            selectedLanguageLinksChanges: links,
        } = this.props;
        this.createLanguageRequest(languageCode, strings, links);
    }

    handleExportButtonClick = () => {
        const {
            selectedLanguageName: languageCode,
            selectedLanguageStrings: strings,
            selectedLanguageLinks: links,
        } = this.props;

        this.startDevLangSaveRequest(languageCode, strings, links);
    }

    handleAddButtonClick = () => {
        this.setState({ showAddStringModal: true });
    }

    handleAddStringClose = () => {
        this.setState({ showAddStringModal: false });
    }

    handleDiscardButtonClick = () => {
        const { selectedLanguageName } = this.props;
        this.props.clearChanges(selectedLanguageName);
    }

    renderHeader = ({ disabled, showExport }) => {
        const keySelector = d => d.code;
        const labelSelector = d => d.title;

        const {
            setSelectedLanguage,
            availableLanguages,
            selectedLanguageName,
            linkCollectionName,
            hasSelectedLanguageChanges,
            hasInvalidChanges,
        } = this.props;

        const {
            showAddStringModal,
            pendingLanguagePut,
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
                        disabled={pendingLanguagePut}
                    />
                    <PrimaryButton
                        onClick={this.handleAddButtonClick}
                        disabled={disabled || pendingLanguagePut}
                    >
                        Add new string
                    </PrimaryButton>
                    <DangerConfirmButton
                        onClick={this.handleDiscardButtonClick}
                        disabled={
                            !hasSelectedLanguageChanges
                                || pendingLanguagePut
                                || disabled
                        }
                        confirmationMessage="Do you want to discard all changes?"
                    >
                        Discard
                    </DangerConfirmButton>
                    { showExport ? (
                        <SuccessButton
                            onClick={this.handleExportButtonClick}
                            disabled={disabled}
                        >
                            Export
                        </SuccessButton>
                    ) : (
                        <SuccessButton
                            disabled={
                                !hasSelectedLanguageChanges
                                    || hasInvalidChanges
                                    || pendingLanguagePut
                                    || disabled
                            }
                            onClick={this.handleSaveButtonClick}
                        >
                            Save
                        </SuccessButton>
                    )}
                    { showAddStringModal &&
                        <EditStringModal
                            onClose={this.handleAddStringClose}
                        />
                    }
                </div>
            </header>
        );
    }

    render() {
        const {
            pendingLanguage,
            linkCollectionName,
            selectedLanguageName,
        } = this.props;
        const {
            pendingLanguagePut,
        } = this.state;

        const Header = this.renderHeader;

        const isDevLangSelected = selectedLanguageName === '$devLang';
        const disabled = isDevLangSelected && isProduction;
        const showExport = isDevLangSelected;

        return (
            <div className={styles.rightPane}>
                { (pendingLanguage || pendingLanguagePut) && <LoadingAnimation /> }
                <Header
                    disabled={disabled}
                    showExport={showExport}
                />
                <div className={styles.content}>
                    <div className={styles.scrollWrapper}>
                        {
                            linkCollectionName === '$all'
                                ? <StringsTable disabled={disabled} />
                                : <LinksTable disabled={disabled} />
                        }
                    </div>
                    <InfoPane disabled={disabled} />
                </div>
            </div>
        );
    }
}
