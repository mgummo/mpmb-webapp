declare global {
    interface Object {
        toSource(): string;
    }
}

declare global {
    interface String {
        toTitleCase(): string;
    }
}

declare global {
    interface HTMLElement {
        replaceWithHTML(string): void;
    }
}

export { };