import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';
import ListView from '#rscv/List/ListView';

import {
    editEntriesEntriesSelector,
    editEntriesWidgetsSelector,
} from '#redux';
import { iconNames } from '#constants';

import { entryAccessor } from '#entities/editEntriesBetter';

import WidgetFaram from '../WidgetFaram';
import { hasWidget } from '../widgets';
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

const mapStateToProps = state => ({
    entries: editEntriesEntriesSelector(state),
    widgets: editEntriesWidgetsSelector(state),
});

@connect(mapStateToProps)
export default class Listing extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    static type = 'list'

    static filterWidgets = widgets => widgets.filter(
        widget => hasWidget(Listing.type, widget.widgetId),
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

        const key = entryAccessor.key(entry);

        return (
            <div
                className={styles.widgetContainer}
                key={key}
            >
                <WidgetFaram
                    className={styles.widget}
                    entry={entry}
                    widgets={this.widgets}
                    pending={pending}
                    type={Listing.type}
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
