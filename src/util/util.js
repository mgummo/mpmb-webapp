
// https://lodash.com/docs/4.17.15#castArray
function castArray(value) {
    if (typeof (value) === "undefined") {
        return [];
    }


    return Array.isArray(value) ? value : [value];
}