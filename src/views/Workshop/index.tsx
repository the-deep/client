import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Button from '#rsca/Button';
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
            <Button>
                Default button
            </Button>
            <Button disabled>
                Disabled button
            </Button>
            <Button buttonType="button-success" >
                Primary button
            </Button>
            <Button buttonType="button-primary" disabled>
                Disabled primary button
            </Button>
            <hr />
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
            New design workshop
        </div>
    );
}

export default Workshop;
