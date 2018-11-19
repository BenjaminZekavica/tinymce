import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import { ItemSpec } from '@ephox/alloy/lib/main/ts/ephox/alloy/ui/types/ItemTypes';
import { InlineContent, Menu, Types } from '@ephox/bridge';
import { Option, Merger } from '@ephox/katamari';

import * as ItemClasses from '../ItemClasses';
import { renderItemStructure } from '../structure/ItemStructure';
import { buildData, renderCommonItem } from './CommonMenuItem';
import { Toggling, Disabling } from '@ephox/alloy';
import ItemResponse from '../ItemResponse';

// TODO: Remove dupe between these
const renderAutocompleteItem = (spec: InlineContent.AutocompleterItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: (itemValue: string, itemMeta: Record<string, any>) => void, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: Option.none(),
    checkMark: Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage);

  return renderCommonItem({
    data: buildData(spec),
    disabled: spec.disabled,
    getApi: () => ({}),
    onAction: (_api) => onItemValueHandler(spec.value, spec.meta),
    onSetup: () => () => { },
    triggersSubmenu: false,
    itemBehaviours: [ ]
  }, structure, itemResponse);
};

const renderChoiceItem = (spec: Menu.ChoiceMenuItem, useText: boolean, presets: Types.PresetItemTypes, onItemValueHandler: (itemValue: string) => void, isSelected: boolean, itemResponse: ItemResponse, providersBackstage: UiFactoryBackstageProviders): ItemSpec => {
  const getApi = (component): Menu.ToggleMenuItemInstanceApi => {
    return {
      setActive: (state) => {
        Toggling.set(component, state);
      },
      isActive: () => Toggling.isOn(component),
      isDisabled: () => Disabling.isDisabled(component),
      setDisabled: (state) => state ? Disabling.disable(component) : Disabling.enable(component)
    };
  };

  const structure = renderItemStructure({
    presets,
    textContent:  useText ? spec.text : Option.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: useText ? spec.shortcut : Option.none(),
    checkMark: Option.none(),
    caret: Option.none(),
    value: spec.value
  }, providersBackstage);

  return Merger.deepMerge(
    renderCommonItem({
      data: buildData(spec),
      disabled: spec.disabled,
      getApi,
      onAction: (_api) => onItemValueHandler(spec.value),
      onSetup: (api) => {
        api.setActive(isSelected);
        return () => {};
      },
      triggersSubmenu: false,
      itemBehaviours: [ ]
    }, structure, itemResponse),
    {
      toggling: {
        toggleClass: ItemClasses.tickedClass,
        toggleOnExecute: false,
        selected: spec.active
      }
    }
  );
};

export { renderChoiceItem, renderAutocompleteItem };