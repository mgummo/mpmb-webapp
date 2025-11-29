(function (window) {

    /** @type {Global}
     *  @ts-ignore */
    const global = window;
    const mpmb = global.mpmb;

    /** @type {BaseFormatter} */
    const TBaseFormatter = global.main.types.BaseFormatter;

    class FeatCardFormatter extends TBaseFormatter {

        constructor() {
            super();
            //this.attack_formatter = global.main.formatters.attack;
        }

        /**
         * @param {FeatDefinition} feat
         */
        build_featcard_vm(feat, character_context) {
            const vm = {}

            vm.name = feat.name;

            // todo: what to do if this is null
            const character_class = feat.from?.key;
            const class_level = feat.from?.level;

            let data = {};
            if (feat.resolve_context) {
                data = feat.resolve_context(character_context);
            }

            if (feat.type == 'class') {

                if (feat.from) {
                    vm.subtitle = `${feat.from.display} Level ${feat.from.level} Feat`
                }
                else {
                    const feat_level = feat.minlevel;
                    vm.subtitle = `${character_class.toTitleCase()} Level ${feat_level} Feat`
                }
            }
            else {
                vm.subtitle = `${feat.type.toTitleCase()} Feat`
            }

            // if (feat.descriptionFull) {
            //     vm.description = feat.descriptionFull;
            // }
            // else 
            if (feat.description) {

                const template = feat.description.full ?? feat.description.summary;
                const text = global.Mustache.render(template, data);

                var converter = new global.showdown.Converter();

                const html = converter.makeHtml(text);
                vm.description = html;
            }

            if (feat.additional?.length) {
                vm.resolved_for_clause = `(Level ${class_level} ${character_class.toTitleCase()})`
            }
            vm.source = this.format_source_book(feat);

            if (data.max_charges) {
                // const charges = feat.usages[class_level];
                vm.charges_checkboxes = new Array(data.max_charges).fill("☐").join(" ");
            }

            return vm;
        }
    }

    global.main.formatters.feat_card = new FeatCardFormatter();

})(window)