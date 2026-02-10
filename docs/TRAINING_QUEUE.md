# Training Queue System Documentation

## Overview

The Training Queue System is an automated queue management feature that allows players to queue multiple model training tasks and have them execute automatically in sequence. This eliminates the need for manual monitoring and clicking to start each training task.

## Features

### Core Functionality

- **Queue Management**: Add up to 10 models to the training queue
- **Auto-Start**: Automatically starts the next model in queue when current training completes
- **Smart Queue**: Skips models that don't have sufficient resources
- **Reordering**: Move models up/down in the queue
- **Repeat Mode**: Optionally repeat the last trained model
- **Persistence**: Queue state is saved and restored

### User Interface

- **Queue Display**: Visual list showing queued models with icons and status
- **Estimated Time**: Shows total estimated completion time for all queued models
- **Queue Counter**: Displays current queue size (e.g., "3 / 10 models")
- **Resource Indicators**: Visual warning for models with insufficient resources
- **Add to Queue Buttons**: Convenient buttons on each model card
- **Control Buttons**: Move up, move down, and remove buttons for each queued item

### Settings

- **Auto-queue Enabled**: Toggle to enable/disable automatic training
- **Repeat Last Model**: Automatically re-queue the last trained model
- **Clear Queue**: Remove all models from the queue at once

## Architecture

### File Structure

```
src/
├── modules/
│   ├── training-queue.js       # Core queue logic
│   └── game-state.js           # Integration with game state
└── ui/
    ├── training-queue-ui.js    # UI component
    └── training-queue-styles.css # Styling
```

### Class: TrainingQueue

**Location**: `src/modules/training-queue.js`

#### Properties

```javascript
{
  game: GameState,           // Reference to game state
  queue: Array<string>,      // Array of model IDs
  enabled: boolean,          // Auto-queue enabled flag
  repeatLastModel: boolean,  // Repeat mode flag
  maxQueueSize: number,      // Maximum queue size (10)
  lastTrainedModel: string   // ID of last trained model
}
```

#### Methods

##### `addToQueue(modelId: string): boolean`
Adds a model to the queue.

**Parameters:**
- `modelId`: The ID of the model to add

**Returns:**
- `true` if successfully added
- `false` if already in queue, queue is full, or model doesn't exist

**Example:**
```javascript
const success = game.trainingQueue.addToQueue('linear-regression');
if (success) {
  console.log('Model added to queue');
}
```

##### `removeFromQueue(modelId: string): boolean`
Removes a model from the queue.

**Parameters:**
- `modelId`: The ID of the model to remove

**Returns:**
- `true` if successfully removed
- `false` if not found in queue

##### `moveUp(modelId: string): boolean`
Moves a model up in the queue (decreases index).

**Parameters:**
- `modelId`: The ID of the model to move

**Returns:**
- `true` if successfully moved
- `false` if already at top or not found

##### `moveDown(modelId: string): boolean`
Moves a model down in the queue (increases index).

**Parameters:**
- `modelId`: The ID of the model to move

**Returns:**
- `true` if successfully moved
- `false` if already at bottom or not found

##### `clearQueue(): void`
Removes all models from the queue.

##### `tryStartNextTraining(): boolean`
Attempts to start training the next model in the queue.

**Returns:**
- `true` if training was started
- `false` if no training started (empty queue, already training, or insufficient resources)

**Logic:**
1. Checks if auto-queue is enabled
2. Checks if already training
3. Handles repeat mode if queue is empty
4. Iterates through queue, skipping models without resources
5. Starts training on first viable model

##### `onTrainingComplete(): void`
Called when a training session completes. Removes the completed model from queue and attempts to start the next training.

##### `canTrainModel(modelId: string): boolean`
Checks if a model can be trained (has resources and is unlocked).

**Parameters:**
- `modelId`: The ID of the model to check

**Returns:**
- `true` if model can be trained
- `false` otherwise

##### `estimateQueueTime(): number`
Calculates the total estimated time to complete all queued models.

**Returns:**
- Total time in seconds

**Calculation:**
- Adds remaining time of current training (if any)
- Adds training time for each queued model
- Accounts for training speed multiplier

##### `getQueueDetails(): Array<Object>`
Returns detailed information about all queued models.

**Returns:**
```javascript
[
  {
    id: string,
    name: string,
    icon: string,
    canTrain: boolean,
    cost: Object
  },
  ...
]
```

##### `toggleEnabled(): boolean`
Toggles auto-queue on/off.

**Returns:**
- New enabled state

##### `toggleRepeat(): boolean`
Toggles repeat last model mode.

**Returns:**
- New repeat state

##### `save(): Object`
Serializes queue state for saving.

**Returns:**
```javascript
{
  queue: Array<string>,
  enabled: boolean,
  repeatLastModel: boolean,
  lastTrainedModel: string
}
```

##### `load(data: Object): void`
Restores queue state from save data.

**Parameters:**
- `data`: Saved queue state object

### Class: TrainingQueueUI

**Location**: `src/ui/training-queue-ui.js`

#### Methods

##### `init(): void`
Initializes the queue UI by creating DOM elements and setting up event listeners.

##### `createQueueUI(): void`
Creates the queue section HTML and inserts it into the DOM after the training status section.

##### `addQueueButtons(): void`
Adds "Add to Queue" buttons to all model cards.

##### `addModelToQueue(modelId: string): void`
Handles adding a model to the queue with user feedback.

##### `removeModelFromQueue(modelId: string): void`
Handles removing a model from the queue with user feedback.

##### `moveModelUp(modelId: string): void`
Handles moving a model up in the queue.

##### `moveModelDown(modelId: string): void`
Handles moving a model down in the queue.

##### `update(): void`
Updates all queue UI elements based on current queue state.

**Updates:**
- Queue count display
- Estimated time display
- Checkbox states
- Queue item list
- "Add to Queue" button states

##### `formatTime(seconds: number): string`
Formats time in seconds to human-readable format.

**Returns:**
- `"5s"` for < 60 seconds
- `"2m 30s"` for < 1 hour
- `"1h 15m"` for >= 1 hour

## Integration with Game State

### Initialization

```javascript
// In GameState constructor
this.trainingQueue = new TrainingQueue(this);
```

### Training Completion Hook

```javascript
// In GameState.completeTraining()
this.stopTraining();
this.trainingQueue.onTrainingComplete(); // Trigger queue
```

### Save/Load Integration

```javascript
// In GameState.save()
trainingQueue: this.trainingQueue.save()

// In GameState.load()
if (saveData.trainingQueue) {
  this.trainingQueue.load(saveData.trainingQueue);
}
```

### Training Speed Helper

```javascript
// In GameState
getTrainingSpeedMultiplier() {
  return this.achievementBonuses.trainingSpeed;
}
```

## User Interface Flow

### Adding Models to Queue

1. Player clicks "Add to Queue" button on a model card
2. `TrainingQueueUI.addModelToQueue()` is called
3. Checks if queue is full
4. Calls `TrainingQueue.addToQueue()`
5. Shows success/warning toast
6. Updates UI
7. Attempts to start training if nothing is currently training

### Automatic Training Flow

1. Player starts training a model (manually or from queue)
2. Training completes
3. `GameState.completeTraining()` is called
4. Calls `TrainingQueue.onTrainingComplete()`
5. Queue removes completed model
6. Queue calls `tryStartNextTraining()`
7. Next viable model starts training automatically
8. UI updates to reflect new queue state

### Queue Reordering

1. Player clicks move up/down button on queue item
2. `TrainingQueueUI.moveModelUp/Down()` is called
3. Calls corresponding `TrainingQueue` method
4. Array elements are swapped
5. UI updates to show new order

## Styling

**Location**: `src/ui/training-queue-styles.css`

### Key CSS Classes

- `.training-queue-section`: Main container
- `.queue-header`: Header with title and info
- `.queue-settings`: Settings controls area
- `.queue-list`: Scrollable list of queue items
- `.queue-item`: Individual queue item
- `.queue-item.insufficient-resources`: Warning state
- `.btn-add-queue`: Add to queue button on model cards
- `.btn-icon`: Small icon buttons (move/remove)

### Responsive Design

Mobile breakpoint at 768px:
- Stack header elements vertically
- Full-width settings
- Smaller icons and fonts
- Adjusted padding

### Animations

- `queueItemAppear`: Slide-in animation for new queue items
- Hover effects on queue items and buttons
- Pulse animation for queue updates

### Accessibility

- `@media (prefers-reduced-motion: reduce)`: Disables animations
- Keyboard navigation support
- High contrast borders
- Focus states

## Best Practices

### Performance

- Queue UI updates are batched in render loop
- DOM manipulation is minimized
- Event listeners are reused

### User Experience

- Clear visual feedback for all actions
- Toasts for important events
- Warning indicators for insufficient resources
- Empty state messaging
- Estimated time helps planning

### Error Handling

- Validates model existence before adding
- Checks queue size limits
- Handles missing resources gracefully
- Logs errors to console

## Future Enhancements

### Potential Features

1. **Drag-and-Drop Reordering**: More intuitive queue management
2. **Queue Presets**: Save and load common queue configurations
3. **Conditional Queue**: Skip models based on custom conditions
4. **Queue Statistics**: Track queue efficiency and success rates
5. **Bulk Operations**: Add multiple models at once
6. **Priority System**: Mark models as high priority
7. **Queue Templates**: Pre-made optimal training sequences
8. **Smart Recommendations**: Suggest next models based on resources

### Performance Optimizations

1. **Virtual Scrolling**: For very long queues (if max size increased)
2. **Debounced UI Updates**: Reduce update frequency
3. **Lazy Loading**: Only render visible queue items

## Troubleshooting

### Queue Not Starting Automatically

**Check:**
- Is auto-queue enabled?
- Are there models in the queue?
- Do models have sufficient resources?
- Is a training already in progress?

### Models Being Skipped

**Reason**: Insufficient resources

**Solution**: 
- Check resource amounts
- Wait for passive generation
- Build more infrastructure
- Remove models you can't afford yet

### Queue Not Saving

**Check:**
- Is localStorage available?
- Is save data too large?
- Are there console errors?

### UI Not Updating

**Check:**
- Is `queueUI.update()` being called in render loop?
- Are there JavaScript errors?
- Is the queue UI initialized?

## Testing Checklist

### Functional Tests

- [ ] Add model to queue
- [ ] Remove model from queue
- [ ] Move model up in queue
- [ ] Move model down in queue
- [ ] Clear entire queue
- [ ] Toggle auto-queue on/off
- [ ] Toggle repeat mode on/off
- [ ] Queue starts next training automatically
- [ ] Queue skips models without resources
- [ ] Queue repeats last model (if enabled)
- [ ] Queue handles full state (10 models)
- [ ] Queue handles empty state
- [ ] Estimated time is accurate
- [ ] Queue persists across page reload

### UI Tests

- [ ] Queue section displays correctly
- [ ] Add to queue buttons appear on model cards
- [ ] Buttons show correct state (in queue, full, available)
- [ ] Queue items show correct icons and names
- [ ] Resource warnings display for unaffordable models
- [ ] Move buttons disabled at top/bottom correctly
- [ ] Empty state displays when queue is empty
- [ ] Settings checkboxes reflect correct state
- [ ] Responsive design works on mobile
- [ ] Animations play smoothly

### Integration Tests

- [ ] Queue integrates with training system
- [ ] Queue integrates with save/load system
- [ ] Queue respects training speed multipliers
- [ ] Queue works with tutorial system
- [ ] Queue works after offline progress
- [ ] Queue interacts correctly with achievements

## Code Examples

### Manually Adding to Queue

```javascript
// Add multiple models to queue
const modelsToTrain = ['linear-regression', 'logistic-regression', 'neural-network'];

modelsToTrain.forEach(modelId => {
  game.trainingQueue.addToQueue(modelId);
});

// Start training if not already training
if (!game.currentTraining) {
  game.trainingQueue.tryStartNextTraining();
}
```

### Checking Queue Status

```javascript
// Get queue length
const queueLength = game.trainingQueue.getLength();
console.log(`Queue has ${queueLength} models`);

// Check if queue is full
if (game.trainingQueue.isFull()) {
  console.log('Queue is full!');
}

// Get estimated completion time
const estimatedTime = game.trainingQueue.estimateQueueTime();
console.log(`Queue will take ~${estimatedTime}s to complete`);
```

### Programmatically Reordering Queue

```javascript
// Move a model to the front
const modelId = 'neural-network';

// Keep moving up until at top
while (game.trainingQueue.queue.indexOf(modelId) > 0) {
  game.trainingQueue.moveUp(modelId);
}
```

## Performance Metrics

### Memory Usage

- Queue: ~1KB per 10 models
- UI: Minimal overhead, reuses DOM elements
- Save data: ~200 bytes

### Update Frequency

- UI updates: Every 100ms (tied to render loop)
- Queue logic: On training completion only
- Save: Every 30 seconds (auto-save)

## Changelog

### v0.3.0 (Initial Release)

**Added:**
- Core TrainingQueue class
- TrainingQueueUI component
- Queue management UI
- Auto-start functionality
- Repeat mode
- Smart resource checking
- Save/load persistence
- Mobile responsive design
- Accessibility features

---

**Last Updated**: February 10, 2026
**Version**: 0.3.0
**Author**: AI-Idle Development Team