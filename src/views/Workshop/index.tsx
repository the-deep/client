import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Icon from '#rscg/Icon';
import Tag from '#components/ui/Tag';

import Container from '#components/ui/Container';
import Button from '#components/ui/Button';
import QuickActionButton from '#components/ui/QuickActionButton';
import QuickActionLink from '#components/ui/QuickActionLink';
import ButtonLikeLink from '#components/ui/ButtonLikeLink';
import Link from '#components/ui/Link';
import TextArea from '#components/ui/TextArea';

import styles from './styles.scss';

function useInputValue(initialValue: string | undefined): [
    string | undefined,
    (v: string | undefined, n: string | undefined, e: React.FormEvent<HTMLTextAreaElement>) => void
] {
    const [value, setValue] = React.useState<string | undefined>(initialValue);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const setInputValue = React.useCallback((newValue: string | undefined, name, e) => {
        setValue(newValue);
    }, [setValue]);

    return [value, setInputValue];
}

interface WorkshopProps {
    className?: string;
}

function Workshop(props: WorkshopProps) {
    const {
        className,
    } = props;

    const [textAreaValue, setTextAreaValue] = useInputValue('');

    return (
        <div className={_cs(styles.workshop, className)}>
            <Container
                heading="Buttons"
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
                heading="Link"
                contentClassName={styles.links}
            >
                <Link to="/">
                    Go to home
                </Link>
                <Link to="https://togglecorp.com">
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
            <Container
                heading="Tags"
                contentClassName={styles.tags}

            >
                <Tag>
                    Environment
                </Tag>
                <Tag variant="complement1">
                    Socio-Cultural
                </Tag>
                <Tag variant="complement2">
                    Tagged
                </Tag>
                <Tag variant="gradient1">
                    Water
                </Tag>
                <Tag
                    variant="gradient2"
                    icons={(
                        <Icon name="globe" />
                    )}
                >
                    Earth
                </Tag>
                <Tag variant="gradient3">
                    Fire
                </Tag>
                <Tag variant="gradient4">
                    River
                </Tag>
                <Tag
                    variant="accent"
                    actions={(
                        <Icon name="add" />
                    )}
                >
                    Nepal
                </Tag>
            </Container>
            <Container
                heading="input"
                contentClassName={styles.inputs}
            >
                <TextArea
                    label="Textarea"
                    value={textAreaValue}
                    onChange={setTextAreaValue}
                />
                <TextArea
                    label="Textarea"
                    value={textAreaValue}
                    onChange={setTextAreaValue}
                    disabled
                />
            </Container>
            <Container
                heading="Quick Action Button"
                sub
                contentClassName={styles.quickActionButtons}
            >
                <QuickActionButton>
                    <Icon name="add" />
                </QuickActionButton>
                <QuickActionButton>
                    <Icon name="edit" />
                </QuickActionButton>
                <QuickActionButton>
                    <Icon name="delete" />
                </QuickActionButton>
            </Container>
            <Container
                heading="Quick Action Link"
                sub
                contentClassName={styles.quickActionButtons}
            >
                <QuickActionLink
                    to="/"
                >
                    <Icon name="add" />
                </QuickActionLink>
                <QuickActionLink
                    to="https://togglecorp.com"
                >
                    <Icon name="openLink" />
                </QuickActionLink>
            </Container>
        </div>
    );
}

export default Workshop;
