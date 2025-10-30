(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;
    const main = global.main;

    class Loader {

        // loads config
        async load_config() {
            await this.load_plugin("../etc/config.js");

            const defaults = {
                plugins: [],
            }

            if (!main.config) {
                main.config = {}
            }

            main.config = {
                ...defaults,
                ...main.config,
            }
        }

        // loads data specified in config
        async run() {
            await this._load_plugins(main.config.plugins)
            const data = this._normalize(mpmb)
            return data
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

        // normalizes all data that was loaded into mpmb
        _normalize(mpmb) {
            this.normalize_spells(mpmb.lists.SpellsList);
            this.normalize_creatures(mpmb.lists.CreatureList);

            let character = main.config.load_character();
            character = this.normalize_character(character);

            return {
                caster: character,
                spells: mpmb.lists.SpellsList,
                monsters: mpmb.lists.CreatureList,
            };
        }

        normalize_character(character) {

            // todo: this isn't working how I expect it
            // mods are being initialized to null instead of calculated
            mpmb.CalcAllSkills(false);
            console.log("fields: %o", global.app.getFields())

            return character;
        }

        normalize_spells(SpellsList) {
            const context = {
                warnings: []
            }
            for (const [key, spell] of Object.entries(SpellsList)) {
                context.key = key
                const result = this.normalize_spell(spell, context);
                if (!result) {
                    delete SpellsList[key];
                }
            }

            if (context.warnings.length) {
                console.debug("The following spells had validation warnings:")
                console.debug(context.warnings);
            }

        }

        normalize_spell(spell, context) {

            const key = context.key;

            // todo: build this up as an array, to cut down on log noise
            // ensure required properties are defined
            if (!spell.source) {
                spell.source = [['HB', 0]]

                const message = "%o is ill-formed: missing source property";
                context.warnings.push([message, spell])
                // console.debug(message, spell)
            }

            if (!spell.classes) {
                spell.classes = []

                const message = "%o is ill-formed: missing classes property"
                context.warnings.push([message, spell])
                // console.debug(message, spell)
            }

            // remove obsolete spells
            if (spell.source[0][0] === "LEGACYSPELLS") {
                return false;
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

            return spell;

        }

        normalize_creatures(CreaturesList) {
            for (const [key, creature] of Object.entries(CreaturesList)) {
                const result = this.normalize_creature(creature, key);
                if (!result) {
                    delete CreaturesList[key];
                }
            }
        }

        normalize_creature(creature, key) {

            // entities are easier to work with, if they have an id
            creature.key = key;

            // mpmb supports creatures with mulitple sizes
            // standardize on an array for this property
            creature.size = castArray(creature.size);

            return creature;
        }


    }

    const loader = new Loader();

    global.main.loader = loader;

})(window)
