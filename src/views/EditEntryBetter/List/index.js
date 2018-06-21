import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '#constants';

import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import ListView from '#rscv/List/ListView';

import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';
import entryAccessor from '../entryAccessor';
import styles from './styles.scss';

const propTypes = {
    entries: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    widgets: PropTypes.array, // eslint-disable-line react/forbid-prop-types
    pending: PropTypes.bool,
};

const defaultProps = {
    entries: [],
    widgets: [],
    pending: false,
};

export default class Listing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static viewMode = 'list'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Listing.viewMode, widget.widgetId),
    );

    constructor(props) {
        super(props);
        this.widgets = Listing.filterWidgets(props.widgets);
    }

    componentWillReceiveProps(nextProps) {
        const { widgets: oldWidgets } = this.props;
        const { widgets: newWidgets } = nextProps;
        if (newWidgets !== oldWidgets) {
            this.widgets = Listing.filterWidgets(newWidgets);
        }
    }

    widgetFaramModifier = (entry) => {
        const {
            pending,
            entries, // eslint-disable-line no-unused-vars
            widgets, // eslint-disable-line no-unused-vars

            ...otherProps
        } = this.props;

        return (
            <div className={styles.widgetContainer}>
                <WidgetFaram
                    className={styles.widget}
                    key={entryAccessor.key(entry)}
                    entry={entry}
                    widgets={this.widgets}
                    pending={pending}
                    viewMode={Listing.viewMode}
                    {...otherProps}
                />
                <div className={styles.actionButtons}>
                    <DangerButton
                        iconName={iconNames.delete}
                    />
                    <WarningButton
                        iconName={iconNames.edit}
                    />
                </div>
            </div>
        );
    }

    render() {
        const { entries } = this.props;

        return (
            <ListView
                className={styles.list}
                data={entries}
                modifier={this.widgetFaramModifier}
            />
        );
    }
}
