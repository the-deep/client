import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
    setLanguageAction,
    selectedLanguageNameSelector,
} from '#redux';

import Detail from './Detail';
import LeftPane from './LeftPane';

import LanguageGet from './requests/LanguageGet';
import styles from './styles.scss';

const propTypes = {
    selectedLanguageName: PropTypes.string.isRequired,
    setLanguage: PropTypes.func.isRequired,
};

const defaultProps = {
};

const mapStateToProps = state => ({
    selectedLanguageName: selectedLanguageNameSelector(state),
});

const mapDispatchToProps = dispatch => ({
    setLanguage: params => dispatch(setLanguageAction(params)),
});

@connect(mapStateToProps, mapDispatchToProps)
export default class StringManagement extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static shouldPullSelectedLang = lang => (lang !== undefined && lang !== '$devLang')

    constructor(props) {
        super(props);

        this.state = {
            pendingLanguage: StringManagement.shouldPullSelectedLang(props.selectedLanguageName),
        };
    }

    componentWillMount() {
        if (StringManagement.shouldPullSelectedLang(this.props.selectedLanguageName)) {
            this.createLanguageRequest(this.props.selectedLanguageName);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.selectedLanguageName !== nextProps.selectedLanguageName) {
            if (StringManagement.shouldPullSelectedLang(nextProps.selectedLanguageName)) {
                this.createLanguageRequest(nextProps.selectedLanguageName);
            } else if (this.languageRequest) {
                this.setState({ pendingLanguage: false });
                this.languageRequest.stop();
            }
        }
    }

    componentWillUnmount() {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }
    }

    createLanguageRequest = (languageCode) => {
        if (this.languageRequest) {
            this.languageRequest.stop();
        }

        const request = new LanguageGet({
            setState: params => this.setState(params),
            setLanguage: this.props.setLanguage,
        });
        this.languageRequest = request.create(languageCode);
        this.languageRequest.start();
    }

    render() {
        const { pendingLanguage } = this.state;

        return (
            <div className={styles.stringPanel}>
                <LeftPane />
                <Detail pendingLanguage={pendingLanguage} />
            </div>
        );
    }
}
