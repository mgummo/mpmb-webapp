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
            console.log("pdf fields: %o", global.app.getFields())

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
                console.debug("The following spells had validation warnings: %o", context.warnings)
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

            creature.type = castArray(creature.type);
            creature.subtype = castArray(creature.subtype)

            creature.abilities = this.build_ability_stats(creature.scores)

            this.calc_save_mods(creature);

            this.fixup_skills(creature);
            creature.defenses = this.build_defenses(creature);

            return creature;
        }

        calc_save_mods(creature) {

                // [Str, Dex, Con, Int, Wis, Cha]
                const base_save = [
                    creature.abilities.str.save_mod,
                    creature.abilities.dex.save_mod,
                    creature.abilities.con.save_mod,
                    creature.abilities.int.save_mod,
                    creature.abilities.wis.save_mod,
                    creature.abilities.cha.save_mod
                ]

                const deltas =[undefined,undefined,undefined,undefined,undefined,undefined,]
                for(let i=0;i<6;i++) {
                    const x = base_save[i]
                    const maybe_adjusted = creature.saves?.[i];
                    const adjusted = (function(maybe_adjusted, x) {
                        if (maybe_adjusted == null) {
                            return x;
                        }
                        if (typeof(maybe_adjusted) == "undefined") {
                            return x;
                        }
                        if (maybe_adjusted == "") {
                            return x;
                        }
                        return maybe_adjusted;

                    })(maybe_adjusted, x)

                    const delta = adjusted - x 
                    if (delta != 0)
                    {
                        // todo: reset save_mod to adjusted value
                        // if delta == prof_bonus then assume has saving throw prof.
                        // otherwise we have an edge case, where there's a saving throw adjustment.
                        // 
                        // todo fix up Camel (stats were set on dex not con), and a few others
                        //
                        if (delta != creature.proficiencyBonus)
                                  
                        {
                            debugger;
                        }
                    }
                    deltas[i] = delta;
                }
        }

        // todo: add prof bonus to save_mod if prof
        // (see calc_save_mods)
        // [Str, Dex, Con, Int, Wis, Cha]
        build_ability_stats(scores) {
            const abilities = {
                'str': {
                    score: scores[0],
                    mod: this.calc_ability_mod(scores[0]),
                    save_mod: this.calc_ability_mod(scores[0])
                },
                'dex': {
                    score: scores[1],
                    mod: this.calc_ability_mod(scores[1]),
                    save_mod: this.calc_ability_mod(scores[1])
                },
                'con': {
                    score: scores[2],
                    mod: this.calc_ability_mod(scores[2]),
                    save_mod: this.calc_ability_mod(scores[2])
                },
                'int': {
                    score: scores[3],
                    mod: this.calc_ability_mod(scores[3]),
                    save_mod: this.calc_ability_mod(scores[3])
                },
                'wis': {
                    score: scores[4],
                    mod: this.calc_ability_mod(scores[4]),
                    save_mod: this.calc_ability_mod(scores[4])
                },
                'cha': {
                    score: scores[5],
                    mod: this.calc_ability_mod(scores[5]),
                    save_mod: this.calc_ability_mod(scores[5])
                },

            }
            return abilities;
        }

        calc_ability_mod(score) {
            const mod = Math.floor((score - 10) / 2);
            return mod;
        }

        fixup_skills(monster) {
            monster.skills = monster.skills ?? {};

            if(Array.isArray(monster.skills)) {
                const result = {}
                for(const elem of monster.skills) {
                    for(const [skill, mod] of Object.entries(elem) ) {
                        result[skill] = mod;
                    }
                }
                monster.skills = result;
            }
        }

        build_defenses(monster) {
            
            const dv = parse_list(monster.damage_vulnerabilities)   
            const dr = parse_list(monster.damage_resistances)
            const di = parse_list(monster.damage_immunities)
            const ci = parse_list(monster.condition_immunities)

            // const v = parse_list(monster.vulnerabilities)
            // const r = parse_list(monster.resistances)
            // const i = parse_list(monster.immunities)

            // not sure what these do - but these don't appear to be set?
            if (monster.vulnerabilities) { debugger; }
            if (monster.resistances) { debugger; }
            if (monster.immunities) { debugger; }

            const defenses = {
                damage_vulnerabilities: dv,
                damage_resistances: dr,
                damage_immunities: di,
                condition_immunities: ci,
            };

            return defenses;
        }
    }

    function parse_list(text) {
        if (!text) {
            return []
        }

        return text.split(",")
            .map( token => token
                .trim()
                .replace(/^and\s+/i, '')
                .toTitleCase()
            )
            .filter(token => token.length > 0);
    }



    const loader = new Loader();

    global.main.loader = loader;

})(window)
