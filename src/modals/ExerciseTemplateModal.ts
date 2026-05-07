import { App, Editor, Modal, Setting } from 'obsidian';
import { ExerciseTemplate } from '../types';
import WorkoutTrackerPlugin from '../plugin';

export class ExerciseTemplateModal extends Modal {
	plugin: WorkoutTrackerPlugin;
	editor: Editor;

	constructor(app: App, plugin: WorkoutTrackerPlugin, editor: Editor) {
		super(app);
		this.plugin = plugin;
		this.editor = editor;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Insert exercise template" });

		this.plugin.settings.exerciseTemplates.forEach(template => {
			new Setting(contentEl)
				.setName(template.name)
				.setDesc(`Type: ${template.type} | Muscle Groups: ${template.muscleGroups.join(', ')}`)
				.addButton(btn => btn
					.setButtonText('Insert')
					.onClick(() => {
						const templateText = this.generateExerciseTemplate(template);
						this.editor.replaceSelection(templateText);
						this.close();
					}));
		});
	}

	generateExerciseTemplate(template: ExerciseTemplate): string {
		let text = `### ${template.name}\n\n`;
		text += `**Type:** ${template.type}\n`;
		text += `**Muscle Groups:** ${template.muscleGroups.join(', ')}\n\n`;
		
		if (template.defaultSets) {
			text += `| Set | Reps | Weight | Duration | Rest |\n`;
			text += `|-----|------|--------|----------|------|\n`;
			for (let i = 1; i <= template.defaultSets; i++) {
				text += `| ${i} | ${template.defaultReps || ''} | ${template.defaultWeight || ''} | ${template.defaultDuration || ''} |  |\n`;
			}
		}
		
		text += `\n**Notes:** \n\n`;
		return text;
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
