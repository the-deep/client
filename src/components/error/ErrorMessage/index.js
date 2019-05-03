import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '#rsca/Button/PrimaryButton';
import Message from '#rscv/Message';

import { handleException, handleReport } from '#config/sentry';

import Cloak from '#components/general/Cloak';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    errorText: PropTypes.string.isRequired,
    reportButtonText: PropTypes.string.isRequired,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class ErrorMessage extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static handleException = handleException;
    static shouldHideReport = ({ isDevMode }) => isDevMode;

    render() {
        const {
            errorText,
            reportButtonText,
            className,
        } = this.props;

        return (
            <div className={_cs(styles.messageContainer, className)}>
                <Message>
                    { errorText }
                    <Cloak
                        hide={ErrorMessage.shouldHideReport}
                        render={
                            <PrimaryButton
                                onClick={handleReport}
                                className={styles.button}
                            >
                                {reportButtonText}
                            </PrimaryButton>
                        }
                    />
                </Message>
            </div>
        );
    }
}
