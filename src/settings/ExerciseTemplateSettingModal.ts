import { App, Modal, Notice, Setting } from 'obsidian';
import { ExerciseTemplate } from '../types';
import WorkoutTrackerPlugin from '../plugin';

export class ExerciseTemplateSettingModal extends Modal {
	plugin: WorkoutTrackerPlugin;
	template: ExerciseTemplate;
	onSave: () => void;

	constructor(app: App, plugin: WorkoutTrackerPlugin, onSave: () => void) {
		super(app);
		this.plugin = plugin;
		this.onSave = onSave;
		this.template = {
			name: '',
			type: 'strength',
			muscleGroups: []
		};
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Add Exercise Template" });

		new Setting(contentEl)
			.setName('Exercise Name')
			.addText(text => text
				.setPlaceholder('Push-up')
				.onChange(async (value) => {
					this.template.name = value;
				}));

		new Setting(contentEl)
			.setName('Exercise Type')
			.addDropdown(dropdown => dropdown
				.addOption('strength', 'Strength')
				.addOption('cardio', 'Cardio')
				.addOption('flexibility', 'Flexibility')
				.addOption('other', 'Other')
				.setValue(this.template.type)
				.onChange(async (value) => {
					this.template.type = value as 'strength' | 'cardio' | 'flexibility' | 'other';
				}));

		new Setting(contentEl)
			.setName('Default Sets')
			.addText(text => text
				.setPlaceholder('3')
				.onChange(async (value) => {
					this.template.defaultSets = value ? parseInt(value) : undefined;
				}));

		new Setting(contentEl)
			.setName('Default Reps')
			.addText(text => text
				.setPlaceholder('10')
				.onChange(async (value) => {
					this.template.defaultReps = value ? parseInt(value) : undefined;
				}));

		new Setting(contentEl)
			.setName(`Default Weight (${this.plugin.settings.weightUnit})`)
			.addText(text => text
				.setPlaceholder('135')
				.onChange(async (value) => {
					this.template.defaultWeight = value ? parseFloat(value) : undefined;
				}));

		new Setting(contentEl)
			.setName('Muscle Groups (comma-separated)')
			.addText(text => text
				.setPlaceholder('chest, triceps, shoulders')
				.onChange(async (value) => {
					this.template.muscleGroups = value.split(',').map(s => s.trim()).filter(s => s);
				}));

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Save Template')
				.setCta()
				.onClick(async () => {
					if (this.template.name && this.template.muscleGroups.length > 0) {
						this.plugin.settings.exerciseTemplates.push(this.template);
						await this.plugin.saveSettings();
						this.onSave();
						this.close();
					} else {
						new Notice('Please fill in name and muscle groups');
					}
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
