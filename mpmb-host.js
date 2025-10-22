// defines interface to shim the [Adobe javascript api](https://opensource.adobe.com/dc-acrobat-sdk-docs/library/jsapiref/doc.html)
// defines interface to interact with the MPMB api

(function (global) {

    Object.prototype.toSource = function () {
        try {
            return "(" + JSON.stringify(this, null, 2) + ")";
        } catch (e) {
            return "[object with circular refs]";
        }
    };

    // function RequiredSheetVersion(version) {
    //     // todo: make robust
    //     // verify version against the only version i've tested against
    //     if (version !== "13.2.3") {
    //         throw `unsupportred version ${version}`
    //     }
    // }

    dict = {};

    const tDoc = {
        getField: (name) => {
            entry = dict[name];
            if (!entry) {
                entry = {
                    value: null,
                    name: name,
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

    class MpmbApp {
        constructor() {
        }

        init() {
            InitiateLists();

            const lists = {

                BackgroundList,
                BackgroundSubList,
                BackgroundFeatureList,
                ClassList,
                ClassSubList,
                CompanionList,
                CreatureList,
                DefaultEvalsList,
                FeatsList,
                MagicItemsList,
                ArmourList,
                WeaponsList,
                AmmoList,
                PacksList,
                GearList,
                ToolsList,
                RaceList,
                RaceSubList,
                SourceList,
                SpellsList,
                PsionicsList,
                spellLevelList,
                spellSchoolList
            }

            this.lists = lists

            console.debug(lists)
        }

        // todo: also implement ExtendWeapon, which takes a partial weapon defintion, and merges it with the existing weapon definition
        AddWeapon(key, weapon) {
            weapon.key = key;
            this.lists.WeaponsList[key] = weapon;
        }

    }

    // shim the acrobat api
    const AcrobatApp = {
        platform: "browser",
        alert: () => { }
    };

    global.app = AcrobatApp;
    global.mpmb = new MpmbApp();

})(window)


