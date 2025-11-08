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

export { };