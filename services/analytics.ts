interface Gtag {
    (command: 'event', action: string, params?: { [key: string]: any }): void;
}

declare global {
    interface Window {
        gtag?: Gtag;
    }
}

export const trackEvent = (
    action: string,
    category: string,
    label: string,
    value?: number
) => {
    if (window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    } else {
        console.warn('Google Analytics gtag not found.');
    }
};
