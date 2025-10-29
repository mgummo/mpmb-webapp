// defines interface to shim the [Adobe javascript api](https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsapiref/doc.html)
// defines interface to interact with the MPMB api

(function (/** @type {any} */ global) {

    Object.prototype.toSource = function () {
        try {
            return "(" + JSON.stringify(this, null, 2) + ")";
        } catch (e) {
            return "[object with circular refs]";
        }
    };

    // dictionary for the PDF fields
    const dict = {};

    const tDoc = {
        getField: (/** @type {string } */ name) => {
            let entry = dict[name];
            if (!entry) {
                entry = {
                    value: null,
                    name: name,

                    isBoxChecked: () => false,
                }
                dict[name] = entry;
            }

            return entry;
        },
        addField: () => { },
        removeField: () => { },

        info: {
            SheetVersion: "0.0.1",      // x.y.z version
            SheetVersionType: "alpha",  // prerelease
            SheetVersionBuild: "",      // build
        },

        bookmarkRoot: {
            children: [
                {
                    children: [
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                        {},
                    ]
                }
            ]
        }
    };

    Object.assign(window, tDoc);

    class MpmbWrapper {
        constructor() {
            // check to see if it looks like mpmb scripts have been included, based on what's been dumped into globla namespace
            if (!global.What || !global.tDoc) {
                // Functions0.js
                throw new Error("MPMB is not loaded!");
            }

            /** @type {Record<string, any>} */
            this._lists = {}

            this.Value = global.Value;
            this.What = global.What;
            this.formatDescriptionFull = global.formatDescriptionFull;
            this.stringSource = global.stringSource;
            this.ParseClass = global.ParseClass;
            this.UpdateLevelFeatures = global.UpdateLevelFeatures;
            this.CalcAC = global.CalcAC;
            this.CalcAllSkills = global.CalcAllSkills;

        }

        init() {

            if (!global.InitiateLists) {
                // Lists.js
                throw new Error("MPMB is not loaded!");
            }

            global.InitiateLists();

            this._lists = {
                BackgroundSubList: global.BackgroundSubList,
                BackgroundFeatureList: global.BackgroundFeatureList,
                ClassList: global.ClassList,
                ClassSubList: global.ClassSubList,
                CompanionList: global.CompanionList,
                CreatureList: global.CreatureList,
                DefaultEvalsList: global.DefaultEvalsList,
                FeatsList: global.FeatsList,
                MagicItemsList: global.MagicItemsList,
                ArmourList: global.ArmourList,
                WeaponsList: global.WeaponsList,
                AmmoList: global.AmmoList,
                PacksList: global.PacksList,
                GearList: global.GearList,
                ToolsList: global.ToolsList,
                RaceList: global.RaceList,
                RaceSubList: global.RaceSubList,
                SourceList: global.SourceList,
                SpellsList: global.SpellsList,
                PsionicsList: global.PsionicsList,
                spellLevelList: global.spellLevelList,
                spellSchoolList: global.spellSchoolList,
            }

            console.debug("Discovered the following lists from mdmb: %o", this.lists)
        }

        get lists() {
            return this._lists;
        }

        AddWeapon(key, weapon) {
            weapon.key = key;
            this.lists.WeaponsList[key] = weapon;
        }

        UpdateWeapon(key, partial_weapon) {
            let weapon = this.lists.WeaponsList[key]
            weapon = { ...weapon, ...partial_weapon }
            this.lists.WeaponsList[key] = weapon;
        }

    }

    const mpmb = new MpmbWrapper();

    // shim the acrobat api
    const AcrobatApp = {
        platform: "browser",
        alert: () => { },
        getField: tDoc.getField,
        getFields: () => {
            return Object.values(dict);
        },
    };

    // defined in the acrobat api, assumed to exist by mbam
    Object.defineProperty(Object.prototype, 'toSource', {
        value: function () {
            try {
                return "(" + JSON.stringify(this, null, 2) + ")";
            } catch (e) {
                return "[object with circular refs]";
            }
        },
        enumerable: false,
    });


    /** @type {Global} */
    const global2 = global;

    global2.app = AcrobatApp;
    global2.mpmb = mpmb;

})(window)

// function RequiredSheetVersion(version) {
//     // todo: make robust
//     // verify version against the only version i've tested against
//     if (version !== "13.2.3") {
//         throw `unsupportred version ${version}`
//     }
// }
