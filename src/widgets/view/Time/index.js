import React from 'react';
import PropTypes from 'prop-types';

import NormalFormattedTime from '#rscv/FormattedTime';
import { FaramOutputElement } from '#rscg/FaramElements';

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
        const {
            className,
        } = this.props;

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
