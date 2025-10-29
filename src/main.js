(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    function sort_spells(spells) {
        spells = spells.sort((lhs, rhs) => {

            if (lhs.level < rhs.level) return -1;
            if (lhs.level > rhs.level) return 1;

            if (lhs.name < rhs.name) return -1;
            if (lhs.name > rhs.name) return 1;

            return 0;
        });

        return spells;
    }

    class Main {

        constructor() {

            // this is initalized when init() is called
            this.config = {};
        }

        // after other plugins have been loaded
        async init() {

            await this._load_config();
            await this._load_plugins(this.config.plugins)
            this.normalize_spells(mpmb.lists.SpellsList);

            let character = this.config.load_character();
            character = this.normalize_character(character);

            // todo: this isn't working how I expect it
            // mods are being initialized to null instead of calculated
            mpmb.CalcAllSkills(false);
            console.log("fields: %o", global.app.getFields())

            var data = {
                caster: character,
                spells: mpmb.lists.SpellsList,
                monsters: mpmb.lists.CreatureList,
            };

            const manifest = this.get_print_manifest(this.config, data);

            // build up view model that binds to the card
            for (const spell of manifest.spells) {
                spell.vm = this.build_spellcard_vm(spell, data.caster)
            }

            return manifest;
        }

        async _load_config() {
            await this.load_plugin("../etc/config.js");

            const defaults = {
                plugins: [],
            }

            if (!this.config) {
                this.config = {}
            }

            this.config = {
                ...defaults,
                ...this.config,
            }
        }

        async _load_plugins(plugins) {
            if (!plugins) {
                return;
            }

            for (const plugin of plugins) {
                await this.load_plugin(plugin);
            }
        }

        load_plugin(url) {

            return new Promise((resolve, reject) => {

                const script = document.createElement('script');
                script.src = url;
                script.async = true;

                // if (resolve)
                script.onload = () => resolve(window); // resolve with global scope
                script.onerror = () => reject(new Error(`Failed to load script ${url}`));

                document.head.appendChild(script);
            });
        }

        normalize_spells(SpellsList) {

            for (const [key, spell] of Object.entries(SpellsList)) {

                // todo: build this up as an array, to cut down on log noise
                // ensure required properties are defined
                if (!spell.source) {
                    console.debug(`%o is ill-formed: missing source property`, spell)
                    spell.source = [['HB', 0]]
                }

                if (!spell.classes) {
                    console.debug(`%o is ill-formed: missing classes property`, spell)
                    spell.classes = []
                }

                // remove obsolete spells
                if (spell.source[0][0] === "LEGACYSPELLS") {
                    delete SpellsList[key];
                }

                // extend spell object with properties that make it easier to work with:

                // spells are easier to work with, if they have a key property
                spell.key = key

                // todo: there's already a allowUpCasting property?
                spell.upcastable = spell.description.includes('/SL');

                // link together the spell with the actions (from the weapon list that it enables)
                spell.action = mpmb.lists.WeaponsList[spell.key]

                if (spell.action) {

                    // support rolling multiple types of damage dice
                    // todo: replace the old damage value with this value instead
                    // instead of making a new property
                    {
                        let damages = spell.action.damage;

                        if (!damages) {
                            spell.action.damages = []
                        }
                        // if array, need to normalize into a multi-array 
                        else if (typeof (damages[0]) !== "object") {
                            spell.action.damages = [damages]
                        }
                    }
                }

                // todo: build up the saving throw stats
                // if (spell.save && !spell.action.save)

            }

        }

        normalize_character(character) {

            // todo: this isn't working how I expect it
            // mods are being initialized to null instead of calculated
            mpmb.CalcAllSkills(false);
            console.log("fields: %o", global.app.getFields())

            return character;
        }

        get_print_manifest(config, data) {

            const all_spells = data.spells;
            const all_monsters = data.monsters;

            const caster = data.caster;

            const spell_filter = build_filter(config.layout["spell-cards"].filter);
            const spells = Object.values(all_spells).filter((spell) => spell_filter(spell, caster));

            const monster_filter = build_filter(config.layout["monster-cards"].filter);
            const monsters = Object.values(all_monsters).filter((monster) => monster_filter(monster))

            return {
                spells,
                monsters,
            };
        }

        build_spellcard_vm(spell, caster, casting_context) {
            // Initially undefined - defined in format.js
            throw new Error("build_spellcard_vm not yet initialized");
        }
    }

    // todo: i haven't tested this yet
    function build_filter(filter_factory, context) {

        if (typeof filter_factory !== "function") {
            throw "invalid filter definition"
        }

        // Check how many parameters the function declares
        if (filter_factory.length != 1) {
            // It's the 2-arg form: (item, context)
            return filter_factory
        }

        // Otherwise, its in factory form
        const filter = filter_factory(context);
        if (typeof filter === "function") {
            return filter;
        }

        // Execpt it didn't return a function. So it prob took in a single item param
        return filter_factory;
    }


    global.main = new Main()

})(window)
