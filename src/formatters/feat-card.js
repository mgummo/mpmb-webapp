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
        build_featcard_vm(feat, context) {
            const vm = {}

            vm.name = feat.name;

            // todo: resolve using context
            const level = 4;
            const class_level = 4;
            const character_class = 'druid'

            if (feat.type == 'class') {

                if (feat.from) {
                    const feat_level = feat.minlevel;
                    vm.subtitle = `${character_class.toTitleCase()} (${feat.from.key.toTitleCase()}) Level ${feat_level} Feat`
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

                let data = {};
                if (feat.resolve_context) {
                    data = feat.resolve_context(context);
                }

                const template = feat.description;
                const text = global.Mustache.render(template, data);

                var converter = new global.showdown.Converter();

                const html = converter.makeHtml(text);
                vm.description = html;
            }

            if (feat.additional?.length) {
                vm.resolved_for_clause = `(Level ${class_level} ${character_class.toTitleCase()})`
            }
            vm.source = this.format_source_book(feat);

            if (feat.usages?.length) {
                const charges = feat.usages[class_level];
                vm.charges_checkboxes = new Array(charges).fill("☐").join(" ");
            }

            return vm;
        }
    }

    global.main.formatters.feat_card = new FeatCardFormatter();

})(window)