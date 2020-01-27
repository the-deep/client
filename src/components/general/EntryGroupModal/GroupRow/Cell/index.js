import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    isSelected: PropTypes.bool,
    isCurrentEntryTagged: PropTypes.bool,
};

const defaultProps = {
    className: undefined,
    isSelected: false,
    isCurrentEntryTagged: false,
};

export default class LabelHeader extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            className,
            isSelected,
            isCurrentEntryTagged,
        } = this.props;

        return (
            <td
                className={_cs(
                    className,
                    styles.cell,
                    isSelected && styles.selected,
                    isCurrentEntryTagged && styles.tagged,
                )}
            />
        );
    }
}
