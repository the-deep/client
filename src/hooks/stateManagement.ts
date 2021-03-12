import { useState, useCallback } from 'react';

// eslint-disable-next-line import/prefer-default-export
export function useModalState(initialValue: boolean): [
    boolean,
    () => void,
    () => void,
    React.Dispatch<React.SetStateAction<boolean>>,
] {
    const [visible, setVisibility] = useState(initialValue);
    const setVisible = useCallback(
        () => {
            setVisibility(true);
        },
        [],
    );
    const setHidden = useCallback(
        () => {
            setVisibility(false);
        },
        [],
    );

    return [visible, setVisible, setHidden, setVisibility];
}

export function useInputValue(initialValue: string | undefined): [
    string | undefined,
    (v: string | undefined, n: string | undefined, e: React.FormEvent<HTMLTextAreaElement>) => void
] {
    const [value, setValue] = useState<string | undefined>(initialValue);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const setInputValue = useCallback((newValue: string | undefined, name, e) => {
        setValue(newValue);
    }, [setValue]);

    return [value, setInputValue];
}
