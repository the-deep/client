import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import OldButton from '#rsu/../v2/Action/Button';

import Container from '#components/ui/Container';
import Button from '#components/ui/Button';
import ButtonLikeLink from '#components/ui/ButtonLikeLink';
import Link from '#components/ui/Link';

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
            <Container heading="Buttons">
                <Container
                    heading="New"
                    sub
                    contentClassName={styles.newButtons}
                >
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
                </Container>
                <Container
                    heading="Old"
                    sub
                    contentClassName={styles.oldButtons}
                >
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
                </Container>
            </Container>
            <Container
                heading="Link"
                contentClassName={styles.links}
            >
                <Link to="/">
                    Go to home
                </Link>
                <Link
                    to="https://togglecorp.com"
                    actions={(
                        <Icon name="chevronRight" />
                    )}
                >
                    Go to Togglecorp website
                </Link>
            </Container>
            <Container
                heading="Button like link"
                contentClassName={styles.buttonLikeLinks}
            >
                <ButtonLikeLink to="/">
                    Add new project
                </ButtonLikeLink>
                <ButtonLikeLink
                    to="/"
                    icons={(
                        <Icon name="add" />
                    )}
                >
                    Create new lead
                </ButtonLikeLink>
            </Container>
        </div>
    );
}

export default Workshop;
