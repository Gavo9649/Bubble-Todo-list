// Select important DOM elements
const taskContainer = document.getElementById('taskContainer');
const taskText = document.getElementById('taskText');
const addTaskButton = document.getElementById('addTaskButton');

// Define a list of color presets
const colorPresets = ['#b92828a6', '#2830c1a6', '#1c9d29a6'];
let selectedCircle = null;
let isDragging = false; // Flag to track if the circle is being dragged

// Create an object to store the current color index for each circle
const circleColorIndexes = {};

// Function to create a new task circle
function createTask(text, savedData) {
    // Create a new task circle element
    const taskCircle = document.createElement('div');
    taskCircle.classList.add('task-circle');

    // Create a new task text element for the user-input text
    const taskTextElement = document.createElement('div');
    taskTextElement.classList.add('task-text');
    taskTextElement.textContent = text;

    // Create a new task title element for the custom title
    const taskTitleElement = document.createElement('div');
    taskTitleElement.classList.add('task-title');

    // Append the task title and task text to the task circle
    taskCircle.appendChild(taskTitleElement);
    taskCircle.appendChild(taskTextElement);

    // Append the task circle to the task container
    taskContainer.appendChild(taskCircle);

    // Set initial circle size and text size
    let circleSize = 100; // Initial circle size
    const minCircleSize = 50; // Minimum circle size
    const maxCircleSize = 500; // Maximum circle size

    // Function to update the circle and text size
    function updateSize() {
        // Update the circle size with minimum and maximum limits
        circleSize = Math.min(maxCircleSize, Math.max(minCircleSize, circleSize));
        taskCircle.style.width = circleSize + 'px';
        taskCircle.style.height = circleSize + 'px';

        // Calculate the maximum text size as a percentage of the circle's radius
        const maxTextSize = circleSize * 0.4; // 40% of the circle's radius

        // Update the text size with minimum and maximum limits
        const textSize = Math.min(maxTextSize, Math.max(minTextSize, maxTextSize));
        taskTextElement.style.fontSize = textSize + 'px';
        taskTitleElement.style.fontSize = textSize + 'px';

        // Save the updated position and size to localStorage
        const taskData = {
            position: {
                left: taskCircle.style.left,
                top: taskCircle.style.top,
            },
            size: {
                width: taskCircle.style.width,
                height: taskCircle.style.height,
            },
        };
        localStorage.setItem('task_' + taskCircle.id, JSON.stringify(taskData));
    }

    // Add a wheel event listener to change the size on scroll
    taskCircle.addEventListener('wheel', (e) => {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05; // Adjust as needed

        // Update circle size
        circleSize *= scaleFactor;

        // Update the size with limits and reposition to keep the center fixed
        const rect = taskCircle.getBoundingClientRect();
        const newWidth = Math.min(maxCircleSize, Math.max(minCircleSize, rect.width * scaleFactor));
        const newHeight = Math.min(maxCircleSize, Math.max(minCircleSize, rect.height * scaleFactor));
        const newTop = rect.top + (rect.height - newHeight) / 2;
        const newLeft = rect.left + (rect.width - newWidth) / 2;

        taskCircle.style.width = newWidth + 'px';
        taskCircle.style.height = newHeight + 'px';
        taskCircle.style.top = newTop + 'px';
        taskCircle.style.left = newLeft + 'px';

        // Update the text size
        updateSize();
    });

    // Add a double click event listener to remove the task
    taskCircle.addEventListener('dblclick', () => {
        taskCircle.remove();
        // Remove saved data from localStorage
        localStorage.removeItem('task_' + taskCircle.id);
        localStorage.removeItem('taskColor_' + taskCircle.id);
    });

    // Add a mousedown event listener to set the dragging flag
    taskCircle.addEventListener('mousedown', () => {
        isDragging = false;
    });

    // Add a mousemove event listener to detect dragging
    taskCircle.addEventListener('mousemove', () => {
        isDragging = true;
    });

    // Add a click event listener to handle click and change color and text
    taskCircle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent the click from propagating to the container

        // Only change the color and text if the circle is not being dragged
        if (!isDragging) {
            // Check if this circle already has a color index
            if (circleColorIndexes[taskCircle] === undefined) {
                // If not, set it to 0 (the first color preset)
                circleColorIndexes[taskCircle] = 0;
            } else {
                // Increment the color index, and wrap around if needed
                circleColorIndexes[taskCircle] = (circleColorIndexes[taskCircle] + 1) % colorPresets.length;
            }

            // Get the current color index for this circle
            const currentIndex = circleColorIndexes[taskCircle];

            // Set the color of the circle based on the current index
            taskCircle.style.backgroundColor = colorPresets[currentIndex];

            // Set this circle as the selectedCircle
            selectedCircle = taskCircle;

            // Set the custom title based on the color
            switch (colorPresets[currentIndex]) {
                case '#b92828a6':
                    taskTitleElement.textContent = 'ENGR1550';
                    break;
                case '#2830c1a6':
                    taskTitleElement.textContent = 'MATH1513';
                    break;
                case '#1c9d29a6':
                    taskTitleElement.textContent = 'CHEM1515';
                    break;
                default:
                    // Default text if color doesn't match any preset
                    taskTitleElement.textContent = 'Other';
                    break;
            }

            // Save the updated color to localStorage
            localStorage.setItem('taskColor_' + taskCircle.id, taskCircle.style.backgroundColor);
        }
    });

    // Make the task circle draggable (Call the dragElement function)
    dragElement(taskCircle);

    // Initialize the size
    updateSize();

    // Load saved data if available
    if (savedData) {
        taskCircle.style.left = savedData.position.left;
        taskCircle.style.top = savedData.position.top;
        taskCircle.style.width = savedData.size.width;
        taskCircle.style.height = savedData.size.height;
        // Load color
        const savedColor = localStorage.getItem('taskColor_' + taskCircle.id);
        if (savedColor) {
            taskCircle.style.backgroundColor = savedColor;
        }
    }

    return taskCircle;
}

// Function to make an element draggable
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (elmnt) {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when the mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Function to load saved data when the page loads
function loadSavedData() {
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('task_')) {
            const taskId = key.replace('task_', '');
            const taskData = JSON.parse(localStorage.getItem(key));
            createTask('Task Name', taskData);
        }
    }
}

// Event listener for adding a new task
addTaskButton.addEventListener('click', () => {
    const taskName = taskText.value.trim();
    if (taskName !== '') {
        const taskCircle = createTask(taskName);
        taskText.value = '';

        // Save the new task's data to localStorage
        const taskData = {
            position: {
                left: taskCircle.style.left,
                top: taskCircle.style.top,
            },
            size: {
                width: taskCircle.style.width,
                height: taskCircle.style.height,
            },
        };
        localStorage.setItem('task_' + taskCircle.id, JSON.stringify(taskData));
    }
});

// Load saved data when the page loads
loadSavedData();
