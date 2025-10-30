// todo: rename fn to match_and_replace
function replace_and_report(str, pattern, replacement) {
    let count = 0;
    const replaced = str.replace(pattern, (...args) => {
        count++;
        return typeof replacement === "function"
            ? replacement(...args)
            : replacement;
    });
    return [replaced, count];
}