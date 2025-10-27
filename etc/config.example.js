// This is an example config file.
// To use, rename to config.js and edit the desired values.
(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    const config = {

        // List of any other scripts to load
        //
        // paths are relative to the index.html file
        plugins: [
            "../path/to/script.js",
            "../path/to/another/script.js",
        ],

        // a function that describes how the character should be loaded
        load_character: function () {

            // option 1: load the character from a character exported from mpmb (.xfdf file)
            // todo: implement this
            // load_pdf(mpmb);
            // const character = main.build_character_from_pdf(mpmb)
            // return character;

            // option2: declare the character manually:
            // const character = make_character()
            // return character;
        }
    }

    function make_character() {
        const character = {
            name: "John Doe",
            level: 1,

            ability: {
                con: 8,
                dex: 8,
                int: 8,
                str: 8,
                wis: 8,
                char: 8
            },

            class: {
                class: 'wizard',
                subclass: null,

                // todo: these values can be computed
                spell_attack_mod: 5,
                spell_save: 12,
                spell_ability: "Int"
            },
        };

        return character;

    }

    global.main.config = config

})(window)