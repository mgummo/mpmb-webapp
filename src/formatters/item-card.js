(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    class ItemCardFormatter {

        constructor() {
            this.base = global.main.formatters.base;
        }

        /**
         * 
         * @param {Mpmb_MagicItem} config 
         * @returns {MagicItemDefinition}
         */
        build_definition(config, context) {

            /** @type {MagicItemDefinition} */
            const definition = /** @type{any}*/ (config);

            definition.key = context.key;
            return definition;
        }

        /**
         * 
         * @param {MagicItemDefinition} _ 
         * @returns {ItemCard}
         */
        build_vm(/** @type {MagicItemDefinition}*/ _) {

            if (_.key == 'staff of the magi') debugger;

            let attunement = "";
            if (_.prerequisite) {
                attunement = _.prerequisite;
            }
            else if (_.attunement) {
                attunement = "Requires Attunement"
            }

            if (attunement) {
                attunement = `(${attunement})`
            }

            /** @type {Rarity | "*" } */
            let rarity = _.rarity;
            // rarity is null, happens when it depends on a choice
            if (!rarity) {
                rarity = "*";
            }

            if (_.usages && typeof (_.usages) != 'number') debugger;

            let charges_checkboxes = null;
            if (_.usages) {
                if (_.usages > 10) {
                    charges_checkboxes = `☐ x ${_.usages}`
                }
                else {
                    charges_checkboxes = new Array(_.usages).fill("☐").join(" ");
                }

            }

            return {
                key: _.key,
                name: _.name,
                subtitle: `${_.type.toTitleCase()}, ${rarity.toTitleCase()} ${attunement}`,
                // description: _.description,
                description: _.descriptionFull,
                source: this.base.format_source_book(_),
                charges_checkboxes,
            }
        }

    }

    global.main.formatters.item_card = new ItemCardFormatter();

})(window)