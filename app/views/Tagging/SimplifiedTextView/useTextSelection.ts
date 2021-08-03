import React from 'react';

type ClientRect = Record<keyof Omit<DOMRect, 'toJSON'>, number>
function isDifferentClientRect(
    prev: ClientRect | undefined | null,
    next: ClientRect | undefined | null,
) {
    if (!prev && next) {
        return true;
    }

    if (prev && next) {
        const clientRectKeys = Object.keys(prev) as (keyof ClientRect)[];

        return clientRectKeys.some((key) => {
            if (prev[key] !== next[key]) {
                return true;
            }

            return false;
        });
    }

    return false;
}

export function useTextSelection(target?: HTMLElement) {
    const [clientRect, setRect] = React.useState<ClientRect>();
    const [isCollapsed, setIsCollapsed] = React.useState<boolean>();
    const [textContent, setText] = React.useState<string>();

    const reset = React.useCallback(() => {
        setRect(undefined);
        setIsCollapsed(undefined);
        setText(undefined);
    }, []);

    const handler = React.useCallback(() => {
        let newRect: ClientRect;
        const selection = window.getSelection();

        if (selection == null || !selection.rangeCount) {
            reset();
            return;
        }

        const range = selection.getRangeAt(0);

        if (target != null && !target.contains(range.commonAncestorContainer)) {
            reset();
            return;
        }

        if (range == null) {
            reset();
            return;
        }

        const contents = range.cloneContents();

        if (contents.textContent != null) {
            setText(contents.textContent);
        }

        const rects = range.getClientRects();

        if (rects.length === 0 && range.commonAncestorContainer != null) {
            const el = range.commonAncestorContainer as HTMLElement;
            newRect = el.getBoundingClientRect().toJSON();
        } else {
            const lastRect = rects.item(rects.length - 1);
            if (lastRect) {
                newRect = lastRect.toJSON();
            }
        }

        setRect((oldRect) => {
            if (isDifferentClientRect(oldRect, newRect)) {
                return newRect;
            }
            return oldRect;
        });

        setIsCollapsed(range.collapsed);
    }, [target, reset]);

    React.useLayoutEffect(() => {
        document.addEventListener('selectionchange', handler);
        document.addEventListener('keydown', handler);
        document.addEventListener('keyup', handler);
        window.addEventListener('resize', handler);

        return () => {
            document.removeEventListener('selectionchange', handler);
            document.removeEventListener('keydown', handler);
            document.removeEventListener('keyup', handler);
            window.removeEventListener('resize', handler);
        };
    }, [target, handler]);

    return {
        clientRect,
        isCollapsed,
        textContent,
    };
}

export default useTextSelection;
