import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';
import { FaramInputElement } from '@togglecorp/faram';

import AccentButton from '#rsca/Button/AccentButton';

import _ts from '#ts';

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    renderer: PropTypes.func.isRequired,
};

@FaramInputElement
export default class FrameworkEditButton extends React.PureComponent {
    static propTypes = propTypes;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleEditClick = () => {
        const { value: widget } = this.props;
        this.setState({
            showModal: true,
            widgetKey: widget.key,
            widgetTitle: widget.title,
            widgetData: widget.properties.data,
            widgetProperties: widget.properties,
        });
    }

    handleCancel = () => {
        this.setState({
            showModal: false,

            widgetKey: undefined,
            widgetTitle: undefined,
            widgetData: undefined,
            widgetProperties: undefined,
        });
    }

    handleChange = (key, data, title) => {
        this.setState({
            widgetTitle: title,
            widgetData: data,
        });
    }

    handleSave = (key, data, title) => {
        const { value } = this.props;
        const { title: originalTitle } = value;

        const settings = {
            title: { $set: title || originalTitle },
            properties: { $auto: {
                data: { $set: data },
            } },
        };

        const newValue = update(value, settings);

        this.setState(
            {
                showModal: false,

                widgetKey: undefined,
                widgetData: undefined,
                widgetProperties: undefined,
                widgetTitle: undefined,
            },
            () => this.props.onChange(newValue),
        );
    }

    render() {
        const { renderer: Widget } = this.props;

        const {
            widgetKey,
            widgetTitle,
            widgetData,
            widgetProperties,

            showModal,
        } = this.state;

        return (
            <Fragment>
                <AccentButton
                    title={_ts('framework.widgetEditor', 'editTooltip')}
                    tabIndex="-1"
                    transparent
                    onClick={this.handleEditClick}
                >
                    {_ts('framework.widgetEditor', 'editTooltip')}
                </AccentButton>
                {
                    showModal &&
                    <Widget
                        widgetKey={widgetKey}
                        title={widgetTitle}
                        data={widgetData}
                        properties={widgetProperties}

                        onSave={this.handleSave}
                        onChange={this.handleChange}
                        closeModal={this.handleCancel}
                    />
                }
            </Fragment>
        );
    }
}
