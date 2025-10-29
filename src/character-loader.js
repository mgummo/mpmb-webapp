(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;
    const main = global.main;

    /**
     * Builds a character, by using the field values from the pdf
     * 
     * @param {MpmbApp} mpmb 
     * @returns {Character}
     */
    function build_character_from_pdf(mpmb) {

        const pdf = global.app;

        /** @type {Character} */
        var character = {};

        character.level = pdf.getField("Character Level").value

        let value = pdf.getField("Class and Levels").value
        const [mainclass, subclass] = mpmb.ParseClass(value) ?? [null, null]

        character.class = {
            // todo: dont know where this is coming from - assume the character level
            level: character.level,

            class: mainclass,
            subclass: subclass,
        }

        character.ability = {}


        const fields = pdf.getFields();
        for (const field of fields) {
            switch (field.name) {

                case 'PC Name':
                    character.player_name = field.value;
                    break;
                case 'Race':
                    character.race = field.value;
                    break;

                case 'Str':
                    character.ability.str = field.value
                    break;
                case 'Dex':
                    character.ability.dex = field.value
                    break;
                case 'Con':
                    character.ability.con = field.value
                    break;
                case 'Int':
                    character.ability.int = field.value
                    break;
                case 'Wis':
                    character.ability.wis = field.value
                    break;
                case 'Cha':
                    character.ability.cha = field.value
                    break;

                    // "Con ST Prof": True
                    // "Int ST Prof": True
                    mpmb.Value('Int ST Prof', true)
                    mpmb.Value('Wis ST Prof', true)


                // already processed before the loop
                case "Character Level":
                case "Class and Levels":
                    break;
                default:
                    console.debug(`Unrecognized field: ${field.name}`)
                    break;
            }

        }

        // todo: fix this.
        // hard code the following for now

        // dict['Wis Mod']
        character.class.spell_mod = 3;

        // dict['Prof Bonus']
        character.class.prof_mod = 2

        // dict['Spell Attack Bonus'] = dict['Prof Bonus'] + dict['Wis Mod']
        character.class.spell_attack_mod = 5

        // dict['Spell Save DC'] = 8 + dict['Prof Bonus'] + dict['Wis Mod'];
        character.class.spell_save = 13

        return character;

    }

    main.build_character_from_pdf = build_character_from_pdf;

})(window)