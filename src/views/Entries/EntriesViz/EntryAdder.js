import React from 'react';
import PropTypes from 'prop-types';

import PrimaryButton from '#rsca/Button/PrimaryButton';

export default class EntryAdder extends React.PureComponent {
    static propTypes = {
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string.isRequired,
        value: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    };

    handleClick = () => {
        const {
            value: entries,
            onChange,
        } = this.props;
        const ids = entries.map(entry => entry.id);
        const maxId = Math.max(...ids);
        // Add a new entry with max id incremented by one
        onChange([...entries, { id: maxId + 1 }]);
    };

    render() {
        const {
            className,
        } = this.props;

        return (
            <span className={className}>
                <PrimaryButton onClick={this.handleClick}>
                    Add new entry
                </PrimaryButton>
            </span>
        );
    }
}
