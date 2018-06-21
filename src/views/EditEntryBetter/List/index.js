import PropTypes from 'prop-types';
import React from 'react';

import { iconNames } from '#constants';

import DangerButton from '#rsca/Button/DangerButton';
import WarningButton from '#rsca/Button/WarningButton';

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

export default class List extends React.PureComponent {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    render() {
        const {
            pending,
            entries,
            widgets,

            ...otherProps
        } = this.props;

        const viewMode = 'list';

        // TODO: move this to componentWillReceiveProps
        const filteredWidgets = widgets.filter(
            widget => hasWidget(viewMode, widget.widgetId),
        );

        return (
            <div className={styles.list}>
                {entries.map(entry => (
                    <div className={styles.widgetContainer}>
                        <WidgetFaram
                            className={styles.widget}
                            key={entryAccessor.key(entry)}
                            entry={entry}
                            widgets={filteredWidgets}
                            pending={pending}
                            viewMode={viewMode}
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
                ))}
            </div>
        );
    }
}
