/// <reference types="@rbxts/types/plugin" />
export = {};

const serverScriptService = game.GetService("ServerScriptService");
const selection = game.GetService("Selection");

const toolbar = plugin.CreateToolbar("UISizeConstraint Maker");
const button = toolbar.CreateButton("Create UISizeConstraint", "Create UISizeConstraint in absolute pixels, based on settings (which are, in turn, based on AbsoluteSize of selected UIs) under ServerScriptService. If you're developing on a big screen, consider making MinSize a lower proportion!", "rbxassetid://119846755100164");

const defaultSettings = { min: 0.8, max: 1.2 };

const settingNames = { min: "MinRelativeSize", max: "MaxRelativeSize" };

function getSizes() {
	const folder = getSettingsFolder();

	const minSize = folder.FindFirstChild(settingNames.min) as NumberValue;
	const maxSize = folder.FindFirstChild(settingNames.max) as NumberValue;

	if (!minSize || !maxSize) return defaultSettings;

	if (minSize.Value > maxSize.Value) {
		warn(`[UISizeConstraintTool] ${settingNames.min} (${minSize.Value}) is greater than ${settingNames.max} (${maxSize.Value}). Swapping values.`);
		const temp = minSize.Value;
		minSize.Value = maxSize.Value;
		maxSize.Value = temp;
	}

	if (minSize.Value > 1) {
		warn(`[UISizeConstraintTool] ${settingNames.min} (${minSize.Value}) is greater than 1. Resetting to 1.`);
		minSize.Value = 1;
	}

	if (maxSize.Value < 1) {
		warn(`[UISizeConstraintTool] ${settingNames.max} (${maxSize.Value}) is smaller than 1. Resetting to 1.`);
		maxSize.Value = 1;
	}

	return { min: minSize.Value, max: maxSize.Value };
}

function getSettingsFolder() {
	const folderName = "UISizeConstraintToolSettings";
	const existingFolder = serverScriptService.FindFirstChild(folderName);

	if (existingFolder !== undefined) return existingFolder;

	const folder = new Instance("Folder");
	folder.Name = folderName;
	folder.Parent = serverScriptService;

	// make 2 new number values
	const minSize = new Instance("NumberValue");
	minSize.Value = defaultSettings.min;
	minSize.Name = settingNames.min;

	const maxSize = new Instance("NumberValue");
	maxSize.Value = defaultSettings.max;
	maxSize.Name = settingNames.max;

	minSize.Parent = folder;
	maxSize.Parent = folder;

	return folder;
}

button.Click.Connect(() => {
	button.SetActive(false);

	const sizes: { min: number, max: number } = getSizes();

	const selected = selection.Get();

	for (const instance of selected) {
		if (!instance.IsA("GuiObject")) continue;

		let constraint = instance.FindFirstChildOfClass("UISizeConstraint");

		if (!constraint) {
			constraint = new Instance("UISizeConstraint");
		}

		constraint.Parent = instance;

		constraint.MinSize = new Vector2(
			math.round(instance.AbsoluteSize.X * sizes.min),
			math.round(instance.AbsoluteSize.Y * sizes.min)
		);

		constraint.MaxSize = new Vector2(
			math.round(instance.AbsoluteSize.X * sizes.max),
			math.round(instance.AbsoluteSize.Y * sizes.max)
		);
	}
});