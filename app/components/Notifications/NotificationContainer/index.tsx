import React from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import {
    IoChevronDown,
    IoChevronUp,
} from 'react-icons/io5';
import {
    Button,
    Container,
    DateOutput,
} from '@the-deep/deep-ui';

import Avatar from '#components/Avatar';
import { useModalState } from '#hooks/stateManagement';

import { Notification } from '../types';
import styles from './styles.css';

interface Props {
    className?: string;
    content?: React.ReactNode;
    userName: string;
    notification: Notification;
    description?: string;
    descriptionLabel?: string;
}

function NotificationContainer(props: Props) {
    const {
        content,
        className,
        userName,
        notification: {
            timestamp,
        },
        description,
        descriptionLabel,
    } = props;

    const [
        isDescriptionShown,,,,
        toggleDescriptionVisibility,
    ] = useModalState(false);

    return (
        <Container
            className={_cs(className, styles.notificationContainer)}
            contentClassName={styles.content}
        >
            <Avatar
                className={styles.displayPicture}
                // NOTE: We'll add user profiles later after we fix it from server side
                src={undefined}
                name={userName}
            />
            <div className={styles.midContainer}>
                <div className={styles.mainText}>
                    {content}
                </div>
                <div className={styles.dateContainer}>
                    <DateOutput
                        format="dd-MM-yyyy at hh:mm AAA"
                        value={timestamp}
                    />
                    {isDefined(description) && (
                        <Button
                            name={undefined}
                            spacing="compact"
                            variant="transparent"
                            onClick={toggleDescriptionVisibility}
                            icons={isDescriptionShown ? <IoChevronUp /> : <IoChevronDown />}
                        >
                            {descriptionLabel}
                        </Button>
                    )}
                </div>
                {description && isDescriptionShown && (
                    <div className={styles.description}>
                        {description}
                    </div>
                )}
            </div>
        </Container>
    );
}

export default NotificationContainer;
