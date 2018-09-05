import React from 'react';
import PropTypes from 'prop-types';

import OrganigramListOutput from '#widgetComponents/OrganigramListOutput';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    widget: PropTypes.object,
    className: PropTypes.string,
};

const defaultProps = {
    className: '',
    widget: undefined,
};

const getOptions = (widget) => {
    const { properties: { data } = {} } = widget;
    return data;
};

export default class OrganigramViewWidget extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static childSelector = d => d.organs;
    static labelSelector = d => d.title;
    static idSelector = d => d.key;

    constructor(props) {
        super(props);
        const { widget } = props;
        const options = getOptions(widget);

        // Data is returned as an array because there might be multiple heads
        this.options = options === undefined ? undefined : [options];
    }

    componentWillReceiveProps(nextProps) {
        const oldOptions = getOptions(this.props.widget);
        const newOptions = getOptions(nextProps.widget);
        if (newOptions !== oldOptions) {
            // Data is returned as an array because there might be multiple heads
            this.options = newOptions === undefined ? undefined : [newOptions];
        }
    }

    render() {
        const {
            className,
        } = this.props;

        return (
            <OrganigramListOutput
                faramElementName="value"
                className={className}
                options={this.options}
                childSelector={OrganigramViewWidget.childSelector}
                labelSelector={OrganigramViewWidget.labelSelector}
                idSelector={OrganigramViewWidget.idSelector}
            />
        );
    }
}
