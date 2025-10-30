
// https://lodash.com/docs/4.17.15#castArray
function castArray(value) {
    return Array.isArray(value) ? value : [value];
}