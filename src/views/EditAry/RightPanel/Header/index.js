import React from 'react';
import PropTypes from 'prop-types';

import NonFieldErrors from '#rsci/NonFieldErrors';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    headingClassName: PropTypes.string,
};

const defaultProps = {
    title: '',
    className: '',
    headingClassName: '',
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            className: classNameFromProps,
            headingClassName,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.header,
        );

        return (
            <header className={className}>
                <h3 className={_cs(styles.heading, headingClassName)}>
                    { title }
                </h3>
                <NonFieldErrors
                    className={styles.nonFieldErrors}
                    faramElement
                />
            </header>
        );
    }
}
