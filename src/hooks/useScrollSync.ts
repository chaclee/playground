import { useEffect, RefObject } from 'react';

export const useScrollSync = (
    sourceRef: RefObject<HTMLElement>,
    targetRef: RefObject<HTMLElement>,
    enabled: boolean = true
) => {
    useEffect(() => {
        if (!enabled) return;

        const source = sourceRef.current;
        const target = targetRef.current;

        if (!source || !target) return;

        let isScrolling = false;

        const handleScroll = (e: Event) => {
            if (isScrolling) return;

            const el = e.target as HTMLElement;
            const other = el === source ? target : source;

            isScrolling = true;

            // Calculate percentage
            const percentage = el.scrollTop / (el.scrollHeight - el.clientHeight);

            // Apply to other
            other.scrollTop = percentage * (other.scrollHeight - other.clientHeight);

            // Debounce reset
            requestAnimationFrame(() => {
                isScrolling = false;
            });
        };

        source.addEventListener('scroll', handleScroll, { passive: true });
        target.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            if (source) {
                source.removeEventListener('scroll', handleScroll);
            }
            if (target) {
                target.removeEventListener('scroll', handleScroll);
            }
        };
    }, [sourceRef, targetRef, enabled]);
};
