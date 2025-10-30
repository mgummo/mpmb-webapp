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

        layout: {
            "spell-cards": {

                /**
                 * example 1 - hard code list
                 * @param {Internal<Spell>} spell 
                 */
                filter1: (spell) => {


                    const selection = ["acid splash", "ray of sickness", "web"]
                    return selection.includes(spell.key);
                },

                /**
                 * example 2 - prepared spells list
                 * @param {Internal<Spell>} spell 
                 * @param {SpellCaster} caster 
                 */
                filter2: (spell, caster) => {
                    return caster.spells.prepared.some(_ => _.key == spell.key);
                },

                /**
                 * example 3 - known spells list
                 * @remarks 
                 * this demonstrates returning a factory function
                 * this can be more efficient - allows precomputing values before filtering starts.
                 * @param {SpellCaster} caster  
                 * @returns (spell, caster) => boolean
                 */
                filter3: (caster) => {
                    const set = new Set(caster.spells.known.map(spell => spell.key));
                    return function (spell, caster) {
                        set.has(spell.key);
                    }
                },

                // all available spells for current level
                filter4: (spell, caster) => {
                    const match_class = spell.classes.includes(caster.class);
                    const match_min = spell.level >= 0;
                    const match_max = spell.level <= caster.level;
                    return match_class && match_min && match_max;
                },

                filter5: (spell, caster) => {
                    const match_class = spell.classes.includes(caster.class);
                    return match_class;
                },

                // all spells
                filter6: () => true,
            },
            "monster-cards": {
                filter1: (/** @type {Creature} */ monster) => {
                    return Number(monster.challengeRating) < 1
                },
                filter2: () => true,
            }
        },

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