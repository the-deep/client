import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';

import WarningButton from '#rsca/Button/WarningButton';
import FaramElement from '#rsci/Faram/FaramElement';

import { iconNames } from '#constants';
import _ts from '#ts';

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    renderer: PropTypes.func.isRequired,
};

@FaramElement('input')
export default class FrameworkEditButton extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleEditClick = () => {
        this.setState({
            showModal: true,
        });
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        });
    }

    handleSave = (data, title) => {
        const { value } = this.props;
        const { title: originalTitle } = value;

        const settings = {
            title: { $set: title || originalTitle },
            properties: { $auto: {
                data: { $set: data },
            } },
        };

        const newValue = update(value, settings);

        this.props.onChange(newValue);

        this.setState({
            showModal: false,
        });
    }

    render() {
        const {
            renderer: Widget,
            value: {
                title,
                properties: {
                    data,
                } = {},
            } = {},
        } = this.props;
        const { showModal } = this.state;

        return (
            <Fragment>
                <WarningButton
                    iconName={iconNames.edit}
                    title={_ts('framework.widgetEditor', 'editTooltip')}
                    tabIndex="-1"
                    transparent
                    onClick={this.handleEditClick}
                />
                {
                    showModal &&
                    <Widget
                        title={title}
                        data={data}
                        onSave={this.handleSave}
                        onClose={this.handleCancel}
                    />
                }
            </Fragment>
        );
    }
}
