import React from 'react';

import MultiViewContainer from '#rscv/MultiViewContainer';
import FixedTabs from '#rscv/FixedTabs';

import InputWorkshop from './InputWorkshop';
import WidgetWorkshop from './WidgetWorkshop';

import styles from './styles.scss';

export default class Workshop extends React.PureComponent {
    constructor(props) {
        super(props);

        this.tabs = {
            input: 'Input',
            widget: 'Widget',
        };

        this.views = {
            input: {
                component: () => (
                    <InputWorkshop
                        className={styles.content}
                    />
                ),
            },
            widget: {
                component: () => (
                    <WidgetWorkshop
                        className={styles.content}
                    />
                ),
            },
        };
    }

    render() {
        return (
            <div>
                <FixedTabs
                    tabs={this.tabs}
                    replaceHistory
                    useHash
                />
                <MultiViewContainer
                    views={this.views}
                    useHash
                />
            </div>
        );
    }
}
