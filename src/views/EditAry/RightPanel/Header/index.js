import React from 'react';
import PropTypes from 'prop-types';

import NonFieldErrors from '#rsci/NonFieldErrors';
import _cs from '#cs';

import styles from './styles.scss';

const propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    title: '',
    className: '',
};

export default class Header extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            title,
            className: classNameFromProps,
        } = this.props;

        const className = _cs(
            classNameFromProps,
            styles.header,
        );

        return (
            <header className={className}>
                <h3 className={styles.heading}>
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
