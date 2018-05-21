import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PrimaryButton from '../../../vendor/react-store/components/Action/Button/PrimaryButton';
import SuccessButton from '../../../vendor/react-store/components/Action/Button/SuccessButton';
import DangerButton from '../../../vendor/react-store/components/Action/Button/DangerButton';
import LoadingAnimation from '../../../vendor/react-store/components/View/LoadingAnimation';
import SelectInput from '../../../vendor/react-store/components/Input/SelectInput';

import {
    setLanguageAction,
    stringMgmtSetSelectedLanguageAction,

    availableLanguagesSelector,
    selectedLanguageNameSelector,
    selectedLinkCollectionNameSelector,
} from '../../../redux';

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
};

const defaultProps = {
};

const mapStateToProps = state => ({
    availableLanguages: availableLanguagesSelector(state),
    selectedLanguageName: selectedLanguageNameSelector(state),
    linkCollectionName: selectedLinkCollectionNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setSelectedLanguage: params => dispatch(stringMgmtSetSelectedLanguageAction(params)),
    setLanguage: params => dispatch(setLanguageAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    renderHeader = () => {
        const keySelector = d => d.code;
        const labelSelector = d => d.title;

        const {
            setSelectedLanguage,
            availableLanguages,
            selectedLanguageName,
            linkCollectionName,
        } = this.props;

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
                        disabled
                    >
                        Add new string
                    </PrimaryButton>
                    <DangerButton
                        disabled
                    >
                        Discard
                    </DangerButton>
                    <SuccessButton
                        disabled
                    >
                        Save
                    </SuccessButton>
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
