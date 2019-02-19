import React from 'react';
import PropTypes from 'prop-types';
import { FaramOutputElement } from '@togglecorp/faram';

import NormalFormattedTime from '#rscv/FormattedTime';

import styles from './styles.scss';

const FormattedTime = FaramOutputElement(NormalFormattedTime);

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
};

export default class TimeListWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const { className: classNameFromProps } = this.props;

        const className = `
            ${classNameFromProps}
            ${styles.timeOutput}
        `;

        return (
            <div className={className} >
                <FormattedTime
                    faramElementName="value"
                    showLabel={false}
                    mode="hh:mm"
                    emptyComponent={null}
                />
            </div>
        );
    }
}
