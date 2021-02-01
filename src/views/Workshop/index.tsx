import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Button from '#components/ui/Button';
import OldButton from '#rsu/../v2/Action/Button';

import styles from './styles.scss';

interface WorkshopProps {
    className?: string;
}

function Workshop(props: WorkshopProps) {
    const {
        className,
    } = props;

    return (
        <div className={_cs(styles.workshop, className)}>
            <div className={styles.buttons}>
                <div className={styles.new}>
                    <Button
                        icons={(
                            <Icon name="add" />
                        )}
                    >
                        Primary / Default button
                    </Button>
                    <Button big>
                        Default button big
                    </Button>
                    <Button disabled>
                        Disabled button
                    </Button>
                    <Button variant="secondary" >
                        Seconadry button
                    </Button>
                    <Button variant="secondary" disabled>
                        Disabled secondary button
                    </Button>
                    <Button variant="tertiary" >
                        Tertiary button
                    </Button>
                    <Button variant="tertiary" disabled>
                        Disabled tertiary button
                    </Button>
                </div>
                <div className={styles.old}>
                    <OldButton>
                        Default button
                    </OldButton>
                    <OldButton disabled>
                        Disabled button
                    </OldButton>
                    <OldButton buttonType="button-primary" >
                        Primary button
                    </OldButton>
                    <OldButton buttonType="button-primary" disabled>
                        Disabled primary button
                    </OldButton>
                </div>
            </div>
        </div>
    );
}

export default Workshop;
