import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import update from 'immutability-helper';

import AccentButton from '#rsca/Button/AccentButton';
import { FaramInputElement } from '#rscg/FaramElements';

import _ts from '#ts';

const propTypes = {
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    onChange: PropTypes.func.isRequired,
    renderer: PropTypes.func.isRequired,
    onModalVisibilityChange: PropTypes.func,
};

const defaultProps = {
    onModalVisibilityChange: () => {},
};

@FaramInputElement
export default class FrameworkEditButton extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
        };
    }

    handleEditClick = () => {
        this.setState({
            showModal: true,
        }, () => this.props.onModalVisibilityChange(true));
    }

    handleCancel = () => {
        this.setState({
            showModal: false,
        }, () => this.props.onModalVisibilityChange(false));
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
