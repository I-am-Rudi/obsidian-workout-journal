import { App, Modal, Setting } from 'obsidian';
import { Workout, Exercise, WorkoutTemplate } from '../types';
import WorkoutTrackerPlugin from '../plugin';

export class QuickWorkoutModal extends Modal {
	plugin: WorkoutTrackerPlugin;

	constructor(app: App, plugin: WorkoutTrackerPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl("h2", { text: "Quick workout log" });
		contentEl.createEl("p", { text: "Select a workout template to quickly log:" });

		this.plugin.settings.workoutTemplates.forEach(template => {
			new Setting(contentEl)
				.setName(template.name)
				.setDesc(`Exercises: ${template.exercises.join(', ')} | Duration: ~${template.estimatedDuration} min`)
				.addButton(btn => btn
					.setButtonText('Use template')
					.onClick(() => {
						void this.createWorkoutFromTemplate(template);
					}));
		});
	}

	async createWorkoutFromTemplate(template: WorkoutTemplate) {
		const workout: Workout = {
			id: Date.now().toString(),
			date: new Date().toISOString().split('T')[0],
			name: template.name,
			exercises: template.exercises.map(exerciseName => {
				const exerciseTemplate = this.plugin.settings.exerciseTemplates.find(t => t.name === exerciseName);
				const exercise: Exercise = {
					name: exerciseName,
					sets: []
				};
				
				if (exerciseTemplate && exerciseTemplate.defaultSets) {
					for (let i = 0; i < exerciseTemplate.defaultSets; i++) {
						exercise.sets.push({
							reps: exerciseTemplate.defaultReps,
							weight: exerciseTemplate.defaultWeight,
							duration: exerciseTemplate.defaultDuration
						});
					}
				}
				
				return exercise;
			}),
			duration: template.estimatedDuration
		};

		await this.plugin.createWorkoutFile(workout);
		this.close();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
