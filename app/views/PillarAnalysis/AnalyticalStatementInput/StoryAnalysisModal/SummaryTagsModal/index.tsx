import React from 'react';

import {
    Modal,
    Button,
} from '@the-deep/deep-ui';

import TagInput from '#components/TagInput';

interface Props {
    widgetTags: string[];
    setWidgetTags: React.Dispatch<React.SetStateAction<string[] | undefined>>;
    handleSubmitButtonClick: () => void;
    onCloseButtonClick: () => void;
}

function SummaryTagsModal(props: Props) {
    const {
        widgetTags,
        setWidgetTags,
        handleSubmitButtonClick,
        onCloseButtonClick,
    } = props;

    return (
        <Modal
            heading="Automatic Summary"
            onCloseButtonClick={onCloseButtonClick}
            footerActions={(
                <Button
                    name={undefined}
                    onClick={handleSubmitButtonClick}
                >
                    Submit tags
                </Button>
            )}
        >
            Please select/add relevant tags to get better summary.

            <TagInput
                name="tags"
                label="Tags"
                value={widgetTags}
                onChange={setWidgetTags}
            />
        </Modal>
    );
}

export default SummaryTagsModal;
