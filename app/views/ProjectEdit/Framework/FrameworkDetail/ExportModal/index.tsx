import React, { useCallback, useState } from 'react';
import { Modal, ButtonLikeLink, Button, Container } from '@the-deep/deep-ui';
import { isDefined, isNotDefined } from '@togglecorp/fujs';
import Section from '#components/entry/Section';

import html2canvas from 'html2canvas';
import { type Framework } from '..';

import styles from './styles.css';
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const emptyObject = {};

type Sections = Framework['primaryTagging']

interface Props {
    title?: string;
    className?: string;
    exportLink: string | undefined;
    onModalClose: () => void;
    sections: Sections | undefined;
}
function ExportModal(props: Props) {
    const {
        title,
        onModalClose,
        className,
        exportLink,
        sections,
    } = props;
    const [isPngExport, setPngExport] = useState(false);

    const handlePngExportClick = useCallback(() => (
        setPngExport(true)
    ), []);

    const handleExportButtonClick = useCallback(() => {
        const sectionsContainer = document.querySelector('#section') as HTMLElement;
        if (isNotDefined(sectionsContainer)) {
            return;
        }
        html2canvas(sectionsContainer).then((canvas) => {
            const sectionPng = document.createElement('a');
            sectionPng.href = canvas.toDataURL('image/png');
            sectionPng.download = `${title}.png`;
            sectionPng.click();
        });
    }, [title]);

    return (
        <Modal
            className={className}
            headingDescription={!isPngExport && 'Choose any one file type for export'}
            heading={isPngExport ? 'Preview' : 'Export'}
            size={isPngExport ? 'large' : 'extraSmall'}
            onCloseButtonClick={onModalClose}
        >
            {!isPngExport ? (
                <div className={styles.exportOption}>
                    {isDefined(exportLink) && (
                        <ButtonLikeLink
                            to={exportLink}
                        >
                            .csv
                        </ButtonLikeLink>
                    )}
                    <Button
                        name=""
                        onClick={handlePngExportClick}
                    >
                        PNG
                    </Button>
                </div>
            ) : (
                <Container
                    className={styles.pngExportModal}
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={handleExportButtonClick}
                        >
                            Export
                        </Button>
                    )}
                >
                    <div
                        id="section"
                    >
                        {sections?.map((section) => (
                            <React.Fragment
                                key={section.clientId}
                            >
                                <div className={styles.sectionTitle}>
                                    {section.title}
                                </div>
                                <Section
                                    allWidgets={undefined}
                                    widgets={section.widgets}
                                    onAttributeChange={noop}
                                    attributesMap={emptyObject}
                                    error={undefined}
                                    readOnly
                                    onGeoAreaOptionsChange={noop}
                                    geoAreaOptions={undefined}
                                    disabled
                                />
                            </React.Fragment>
                        ))}
                    </div>
                </Container>
            )}
        </Modal>
    );
}

export default ExportModal;
