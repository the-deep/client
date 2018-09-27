import PropTypes from 'prop-types';
import React from 'react';

import WarningConfirmButton from '#rsca/ConfirmButton/WarningConfirmButton';

import { iconNames } from '#constants';
import _ts from '#ts';

import UseWordCategoryRequest from './requests/UseWordCategoryRequest';

const propTypes = {
    currentWordCategoryId: PropTypes.number,
    disabled: PropTypes.bool,
    wordCategoryId: PropTypes.number.isRequired,
    wordCategoryTitle: PropTypes.string.isRequired,
    projectId: PropTypes.number.isRequired,
    setProjectWordCategory: PropTypes.func.isRequired,
};

const defaultProps = {
    currentWordCategoryId: undefined,
    disabled: false,
};

export default class UseWordCategoryButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);

        const { setProjectWordCategory } = this.props;

        this.state = { pending: false };

        this.useWordCategoryRequest = new UseWordCategoryRequest({
            setState: d => this.setState(d),
            setProjectWordCategory,
        });
    }

    handleWordCategoryConfirmClose = () => {
        const {
            wordCategoryId,
            projectId,
        } = this.props;

        this.useWordCategoryRequest
            .init(wordCategoryId, projectId)
            .start();
    }

    render() {
        const {
            wordCategoryId,
            wordCategoryTitle,
            currentWordCategoryId,
            disabled,
        } = this.props;
        const { pending } = this.state;

        if (wordCategoryId === currentWordCategoryId) {
            // If current wordCategory is already being used
            return null;
        }

        const useWordCategoryButtonLabel = _ts('project.wordCategory', 'useWordCategoryButtonTitle');
        const confirmationMessage = (
            <React.Fragment>
                <p>
                    { _ts('project.wordCategory', 'confirmUseWordCategory', {
                        title: <b>{wordCategoryTitle}</b>,
                    }) }
                </p>
                <p>
                    { _ts('project.wordCategory', 'confirmUseWordCategoryText') }
                </p>
            </React.Fragment>
        );

        return (
            <WarningConfirmButton
                iconName={iconNames.check}
                onClick={this.handleWordCategoryConfirmClose}
                disabled={disabled || pending}
                confirmationMessage={confirmationMessage}
            >
                { useWordCategoryButtonLabel }
            </WarningConfirmButton>
        );
    }
}
