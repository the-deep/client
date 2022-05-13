import { useEffect } from 'react';

function usePromptOnCloseAndRefresh(pristine: boolean) {
    useEffect(() => {
        const alertUser = (e: BeforeUnloadEvent) => {
            if (pristine) {
                return undefined;
            }
            // NOTE: This text is not applied anywhere
            // We do not have the ability to change the message text due to security concerns
            const dialogText = 'Are you sure you want to leave? Any unsaved changes will be lost.';
            e.returnValue = dialogText;
            return dialogText;
        };

        window.addEventListener('beforeunload', alertUser);
        return () => {
            window.removeEventListener('beforeunload', alertUser);
        };
    }, [pristine]);
}

export default usePromptOnCloseAndRefresh;
