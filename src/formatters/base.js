(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;

    /** type MpmbApp */
    const mpmb = global.mpmb;

    const { glossary, regex } = build_abbreviation_glossary();

    /** @type {BaseFormatter} */
    class BaseFormatter {

        // todo: confirm this function isn't defined elsewhere, in mpmb repo
        /**
         * Expands the given text by searching for and replacing abbreviations.
         * 
         * @param {string} text
         */
        unabbreviate(text) {
            text = text ?? "";
            const result = text.replace(regex, match => glossary[match] ?? match);
            return result;
        }

        format_ability(text) {
            switch (text) {
                case 1:
                    return "Str";
                case 2:
                    return 'Dex';
                case 3:
                    return 'Con';
                case 4:
                    return 'Int';
                case 5:
                    return 'Wis';
                case 6:
                    return 'Cha';
                default:
                    return text;
            }
        }

        // format number with + or - sign prefix
        format_modifier(amount) {
            if (amount >= 0) {
                return `+${amount}`
            }
            else {
                return `${amount}`
            }

        }

        // todo: format differently
        // 'name - p123; name - p123'
        format_source_book(entity) {
            return mpmb.stringSource(entity, "full,page,multi");
        }

        toLowerCase(str) {
            return str.toLowerCase()
        }

        toTitleCase(str) {
            if (!str) {
                return "";
            }

            const ignore = new Set(["to", "of", "the", "or"]);

            return str
                .split(/\s+/)
                .map((word, index) => {
                    const lower = word.toLowerCase();

                    // If this is not the first word AND it's on the ignore list, leave it lowercase
                    if (index > 0 && ignore.has(lower)) {
                        return lower;
                    }

                    // Title-case the word, even if it begins with punctuation
                    return word.replace(
                        /^(\p{P}?)(.)(.*)$/u,
                        (match, punct, first, rest) => punct + first.toUpperCase() + rest.toLowerCase()
                    );
                })
                .join(" ");
        }


    }

    function build_abbreviation_glossary() {
        // init the abbreviation glossary at startup
        const glossary = Object.fromEntries([
            ["ft", "foot"],
            ["gal", "gallons"],
            ["hr", "hour"],
            ["hrs", "hours"],
            ["cu", "cube"],
            ["crea", "creature"],
            ['obj', 'object'],
            ["chks", "checks"],
            ['Ath', 'Athletics'],
            ["adv", "advantage"],   //todo: this is actually abbreviated as adv. but regex matching is failing on period.
            ["dmg", "damage"],
            ["wea", "weapon"],
            ["atk", 'attack'],
            ["qtrstaff", "Quarterstaff"],
            ["1 a", "1 action"],    // todo: regex isn't matching this because of the space
            ['bns ', 'Bonus Action'],
            ['dif. ter.', 'Difficult Terrian'], // todo: not working
            ['cons', 'consumed'],
            ['see B', '']           // no need to see book, full details are on card // todo: implement this
        ]);

        // get the abbreviations, and escape them for regex
        const escaped_abbreviations = Object.keys(glossary)
            .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

        // build up a regex that matches on those abbreviations
        const regex = new RegExp(`\\b(${escaped_abbreviations.join("|")})\\b`, "gi");

        return { glossary, regex }
    }

    // poor man modules - formatters are registered in the corresponding .js file
    global.main.formatters = {
        base: new BaseFormatter(),
        attack: undefined,
        item_card: undefined,
        monster_card: undefined,
        spell_card: undefined,
        feat_card: undefined,
    };

})(window)


